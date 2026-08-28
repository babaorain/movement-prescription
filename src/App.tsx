import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  CircleStop,
  Clock3,
  Copy,
  Dumbbell,
  ExternalLink,
  Footprints,
  Hand,
  HeartPulse,
  Info,
  ListChecks,
  Minus,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Stethoscope,
  Stethoscope as ExamIcon,
  X,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Brand } from './components/Brand'
import { DoctorTopbar, type DoctorView } from './components/DoctorTopbar'
import { PhysicalExam } from './components/PhysicalExam'
import {
  conditionName,
  conditions,
  exercisesFor,
  flowEntryFor,
  getCondition,
  getExercise,
  getFlowStep,
  getSubtype,
  regions,
  subtypesFor,
} from './data'
import { cloneDose, decodePrescription, formatDose, prescriptionUrl } from './lib/prescription'
import type { ConditionId, Dose, FlowStep, FlowTarget, Prescription, RegionId, SelectedExercise } from './types'

const frequencies = ['每天 1 次', '每天 2 次', '每天 3 次', '每週 3 次', '每週 5 次'] as const

function localDateStamp(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function StepHeading({ number, title, hint }: { number: number; title: string; hint?: string }) {
  return (
    <div className="step-heading">
      <span className="step-heading__number">{number}</span>
      <div>
        <h2>{title}</h2>
        {hint && <p>{hint}</p>}
      </div>
    </div>
  )
}

function ConditionIcon({ region }: { region: RegionId }) {
  if (region === 'elbow-hand') return <Hand />
  if (region === 'knee' || region === 'foot-ankle' || region === 'hip') return <Footprints />
  if (region === 'spine') return <Dumbbell />
  return <Activity />
}

function ExerciseThumb({ id, className }: { id: string; className?: string }) {
  const exercise = getExercise(id)
  if (exercise?.image) return <img className={className} src={exercise.image} alt="" />
  return (
    <span className={`exercise-thumb ${className ?? ''}`} aria-hidden="true"><Activity /></span>
  )
}

function makeSelection(subtypeId: string): SelectedExercise[] {
  const subtype = getSubtype(subtypeId)
  return (subtype?.presetIds ?? [])
    .map((id) => getExercise(id))
    .filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise))
    .map((exercise) => ({ id: exercise.id, dose: cloneDose(exercise.dose) }))
}

function DoseEditor({ dose, onChange }: { dose: Dose; onChange: (dose: Dose) => void }) {
  const step = (field: 'reps' | 'sets' | 'minutes', delta: number) => {
    if (dose.type === 'duration' && field === 'minutes') {
      onChange({ ...dose, minutes: Math.max(3, Math.min(30, dose.minutes + delta)) })
    }
    if (dose.type === 'reps' && field === 'reps') {
      onChange({ ...dose, reps: Math.max(3, Math.min(20, dose.reps + delta)) })
    }
    if (dose.type === 'reps' && field === 'sets') {
      onChange({ ...dose, sets: Math.max(1, Math.min(5, dose.sets + delta)) })
    }
  }

  return (
    <div className="dose-editor" aria-label="調整運動劑量">
      {dose.type === 'reps' ? (
        <>
          <Stepper label="次" value={dose.reps} onMinus={() => step('reps', -1)} onPlus={() => step('reps', 1)} />
          <span className="dose-editor__times">×</span>
          <Stepper label="組" value={dose.sets} onMinus={() => step('sets', -1)} onPlus={() => step('sets', 1)} />
        </>
      ) : (
        <Stepper label="分鐘" value={dose.minutes} onMinus={() => step('minutes', -1)} onPlus={() => step('minutes', 1)} />
      )}
      <select
        aria-label="運動頻率"
        value={dose.frequency}
        onChange={(event) => onChange({ ...dose, frequency: event.target.value as Dose['frequency'] })}
      >
        {frequencies.map((frequency) => <option key={frequency}>{frequency}</option>)}
      </select>
    </div>
  )
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="stepper">
      <button type="button" onClick={onMinus} aria-label={`減少${label}`}><Minus size={16} /></button>
      <output aria-live="polite"><b>{value}</b><span>{label}</span></output>
      <button type="button" onClick={onPlus} aria-label={`增加${label}`}><Plus size={16} /></button>
    </div>
  )
}

type FlowAnswer = { stepId: string; question: string; answer: string }

/** 症狀 → 紅旗 → 病史問答 → 理學檢查 → 收斂到一個診斷或一個轉介建議。 */
function SymptomFlow({ adopted, onAdopt, onReopenScreening }: {
  adopted: ConditionId | null
  onAdopt: (condition: ConditionId, screened: boolean) => void
  /** 回到紅旗篩檢就代表警訊還沒重新確認過，安全篩檢必須跟著失效。 */
  onReopenScreening: () => void
}) {
  const [region, setRegion] = useState<RegionId | null>(null)
  const [answers, setAnswers] = useState<FlowAnswer[]>([])
  const [currentStepId, setCurrentStepId] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<FlowTarget | null>(null)
  const [flagged, setFlagged] = useState<string[]>([])
  const [screened, setScreened] = useState(false)

  const currentStep = currentStepId ? getFlowStep(currentStepId) : undefined

  useEffect(() => { setFlagged([]) }, [currentStepId])

  const startRegion = (next: RegionId) => {
    const entry = flowEntryFor(next)
    setRegion(next)
    setAnswers([])
    setOutcome(null)
    setScreened(false)
    setCurrentStepId(entry?.id ?? null)
    onReopenScreening()
  }

  const advance = (step: FlowStep, question: string, answer: string, target: FlowTarget) => {
    setAnswers((items) => [...items, { stepId: step.id, question, answer }])
    if (target.kind === 'step') {
      setCurrentStepId(target.id)
      setOutcome(null)
    } else {
      setCurrentStepId(null)
      setOutcome(target)
    }
  }

  const goBack = () => {
    const previous = answers[answers.length - 1]
    if (!previous) return
    setAnswers((items) => items.slice(0, -1))
    setCurrentStepId(previous.stepId)
    setOutcome(null)
    if (getFlowStep(previous.stepId)?.kind === 'redflag') {
      setScreened(false)
      onReopenScreening()
    }
  }

  if (!region) {
    return (
      <div className="flow">
        <p className="flow__lead">先選症狀所在的部位，接著回答幾個問題與理學檢查結果，工具會逐步縮小可能診斷。</p>
        <div className="region-grid">
          {regions.map((item) => (
            <button type="button" key={item.id} className="region-card" onClick={() => startRegion(item.id)}>
              <ConditionIcon region={item.id} />
              <span><b>{item.name}</b><small>{item.hint}</small></span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const regionLabel = regions.find((item) => item.id === region)?.name ?? ''

  return (
    <div className="flow">
      <div className="flow__toolbar">
        <span className="flow__region">{regionLabel}</span>
        <div>
          {answers.length > 0 && <button type="button" onClick={goBack}><ArrowLeft size={15} />上一步</button>}
          <button type="button" onClick={() => setRegion(null)}><RotateCcw size={15} />重選部位</button>
        </div>
      </div>

      {answers.length > 0 && (
        <ol className="flow__trail">
          {answers.map((item, index) => (
            <li key={`${item.stepId}-${index}`}>
              <span>{item.question}</span>
              <b>{item.answer}</b>
            </li>
          ))}
        </ol>
      )}

      {currentStep?.kind === 'redflag' && (
        <div className="flow-card flow-card--redflag">
          <div className="flow-card__head">
            <AlertTriangle size={18} />
            <div><h3>{currentStep.title}</h3>{currentStep.detail && <p>{currentStep.detail}</p>}</div>
          </div>
          <ul className="flag-list">
            {(currentStep.flags ?? []).map((flag) => (
              <li key={flag}>
                <label className={flagged.includes(flag) ? 'is-checked' : ''}>
                  <input
                    type="checkbox"
                    checked={flagged.includes(flag)}
                    onChange={(event) => setFlagged((items) => event.target.checked
                      ? [...items, flag]
                      : items.filter((item) => item !== flag))}
                  />
                  <span className="confirmation__box"><Check size={14} /></span>
                  <span>{flag}</span>
                </label>
              </li>
            ))}
          </ul>
          {flagged.length > 0 ? (
            <div className="referral-block">
              <CircleStop />
              <span>
                <b>{currentStep.referTitle}</b>
                {currentStep.referDetail}
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="button button--primary flow-card__continue"
              onClick={() => {
                setScreened(true)
                advance(currentStep, currentStep.title, '以上皆無', currentStep.clear!)
              }}
            >以上皆無，繼續</button>
          )}
        </div>
      )}

      {currentStep && currentStep.kind !== 'redflag' && (
        <div className="flow-card">
          <div className="flow-card__head">
            {currentStep.kind === 'exam' ? <ExamIcon size={18} /> : <ListChecks size={18} />}
            <div>
              <span className="flow-card__kind">{currentStep.kind === 'exam' ? '理學檢查' : '病史問答'}</span>
              <h3>{currentStep.title}</h3>
              {currentStep.detail && <p>{currentStep.detail}</p>}
            </div>
          </div>
          {currentStep.method && <p className="flow-card__method"><b>怎麼做：</b>{currentStep.method}</p>}
          <div className="flow-options">
            {(currentStep.options ?? []).map((option) => (
              <button
                type="button"
                key={option.label}
                onClick={() => advance(currentStep, currentStep.title, option.label, option.target)}
              >
                <span><b>{option.label}</b>{option.detail && <small>{option.detail}</small>}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {outcome?.kind === 'refer' && (
        <div className="flow-card flow-card--refer">
          <div className="flow-card__head">
            <CircleStop size={18} />
            <div><h3>{outcome.title}</h3><p>{outcome.detail}</p></div>
          </div>
          <p className="flow-card__foot">若您的臨床判斷與此建議不同，可切換到「診斷庫」自行選擇診斷。</p>
        </div>
      )}

      {outcome?.kind === 'condition' && (
        <div className="flow-card flow-card--result">
          <div className="flow-card__head">
            <CheckCircle2 size={18} />
            <div>
              <span className="flow-card__kind">導引結果</span>
              <h3>{conditionName(outcome.id)}</h3>
              <p>{getCondition(outcome.id).hint}・{getCondition(outcome.id).aka}</p>
            </div>
          </div>
          {outcome.note && <p className="flow-card__foot">{outcome.note}</p>}
          {adopted === outcome.id ? (
            <p className="flow-card__adopted"><Check size={16} />已採用。請到下方第 2–4 步調整分型、動作與劑量。</p>
          ) : (
            <div className="flow-card__actions">
              <button type="button" className="button button--primary" onClick={() => onAdopt(outcome.id, screened)}>
                採用這個診斷 <Check size={17} />
              </button>
              <button type="button" className="button button--secondary" onClick={goBack}>回上一步改選</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EducationPreview({ condition }: { condition: ConditionId }) {
  const data = getCondition(condition)
  return (
    <div className="education-preview">
      <div className="education-preview__head"><BookOpen size={17} /><b>會一起給病人的衛教與建議</b></div>
      <p><b>這是什麼：</b>{data.education.what}</p>
      <p><b>為什麼會這樣：</b>{data.education.why}</p>
      <p><b>大概會怎麼走：</b>{data.education.course}</p>
      <p><b>常見誤解：</b>{data.education.myth}</p>
      <p><b>活動調整：</b>{data.lifestyle.join('／')}</p>
      <p><b>回診時機：</b>{data.followUp.join('／')}</p>
    </div>
  )
}

function DoctorBuilder({ onNavigate }: { onNavigate: (view: DoctorView) => void }) {
  const [mode, setMode] = useState<'symptom' | 'library'>('symptom')
  const [condition, setCondition] = useState<ConditionId | null>(null)
  const [subtypeId, setSubtypeId] = useState<string | null>(null)
  const [selected, setSelected] = useState<SelectedExercise[]>([])
  const [regionFilter, setRegionFilter] = useState<RegionId | 'all'>('all')
  const [diagnosisQuery, setDiagnosisQuery] = useState('')
  const [safety, setSafety] = useState<'safe' | 'refer' | null>(null)
  const [screenedInFlow, setScreenedInFlow] = useState(false)
  const [claudication, setClaudication] = useState<'yes' | 'no' | null>(null)
  const [directionConfirmed, setDirectionConfirmed] = useState(false)
  const [scopeConfirmed, setScopeConfirmed] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const qrAreaRef = useRef<HTMLDivElement>(null)

  const currentCondition = condition ? getCondition(condition) : null
  const currentSubtype = subtypeId ? getSubtype(subtypeId) : undefined
  const conditionSubtypes = condition ? subtypesFor(condition) : []
  const availableExercises = condition
    ? exercisesFor(condition).filter((exercise) => !(claudication === 'yes' && exercise.avoidFor?.includes('lumbar-stenosis')))
    : []

  const normalizedQuery = diagnosisQuery.trim().toLocaleLowerCase('zh-TW')
  const filteredConditions = conditions.filter((item) => {
    const matchesRegion = regionFilter === 'all' || item.region === regionFilter
    const searchable = [item.name, item.aka ?? '', item.hint, ...item.keywords].join(' ').toLocaleLowerCase('zh-TW')
    return matchesRegion && (!normalizedQuery || searchable.includes(normalizedQuery))
  })

  const currentPrescription: Prescription | null = useMemo(() => (condition && subtypeId ? {
    v: 2,
    condition,
    subtype: subtypeId,
    exercises: selected,
    createdAt: localDateStamp(),
    sourceVersion: '2026.08',
  } : null), [condition, subtypeId, selected])

  const ready = Boolean(currentPrescription)
    && safety === 'safe'
    && selected.length >= 1
    && (condition !== 'low-back' || claudication !== null)
    && (!currentCondition?.confirm || scopeConfirmed)
    && (!currentSubtype?.needsDirectionalConfirmation || directionConfirmed)

  const invalidate = () => {
    setGeneratedUrl('')
    setCopied(false)
  }

  const chooseCondition = (next: ConditionId, screened = false) => {
    const firstSubtype = subtypesFor(next)[0]
    setCondition(next)
    setSubtypeId(firstSubtype?.id ?? null)
    setSelected(firstSubtype ? makeSelection(firstSubtype.id) : [])
    setClaudication(null)
    setSafety(screened ? 'safe' : null)
    setScreenedInFlow(screened)
    setDirectionConfirmed(false)
    setScopeConfirmed(false)
    invalidate()
  }

  const chooseSubtype = (next: string) => {
    if (next === 'back-extension' && claudication !== 'no') return
    setSubtypeId(next)
    setSelected(makeSelection(next))
    setDirectionConfirmed(false)
    invalidate()
  }

  const chooseClaudication = (answer: 'yes' | 'no') => {
    setClaudication(answer)
    if (answer === 'yes') {
      const hasExtensionExercise = selected.some((item) => getExercise(item.id)?.avoidFor?.includes('lumbar-stenosis'))
      if (subtypeId === 'back-extension' || hasExtensionExercise) {
        setSubtypeId('back-general')
        setSelected(makeSelection('back-general'))
        setDirectionConfirmed(false)
      }
    }
    invalidate()
  }

  const updateExercise = (index: number, id: string) => {
    setSelected((items) => items.map((item, itemIndex) => itemIndex === index
      ? { id, dose: cloneDose(getExercise(id)!.dose) }
      : item))
    invalidate()
  }

  const updateDose = (index: number, dose: Dose) => {
    setSelected((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, dose } : item))
    invalidate()
  }

  const removeExercise = (index: number) => {
    setSelected((items) => items.filter((_, itemIndex) => itemIndex !== index))
    invalidate()
  }

  const addExercise = () => {
    const next = availableExercises.find((exercise) => !selected.some((item) => item.id === exercise.id))
    if (!next) return
    setSelected((items) => [...items, { id: next.id, dose: cloneDose(next.dose) }])
    invalidate()
  }

  const generate = () => {
    if (!ready || !currentPrescription) return
    setGeneratedUrl(prescriptionUrl(currentPrescription))
    window.setTimeout(() => qrAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  const copyLink = async () => {
    if (!generatedUrl) return
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const blockingHint = !condition
    ? '請先從症狀導引或診斷庫決定診斷。'
    : condition === 'low-back' && claudication === null
      ? '請先完成走路症狀快篩。'
      : safety === null
        ? '請先完成安全篩檢。'
        : safety === 'refer'
          ? '有警訊時不開立運動處方。'
          : currentCondition?.confirm && !scopeConfirmed
            ? '請先確認這個診斷的適用邊界。'
            : '請先確認方向偏好。'

  return (
    <div className="app-shell doctor-app">
      <DoctorTopbar active="prescription" onNavigate={onNavigate} />

      <main className="builder-layout">
        <section className="builder" aria-label="運動處方設定">
          <div className="builder__intro">
            <p className="eyebrow"><Stethoscope size={16} /> 醫師端</p>
            <h1>從症狀開始，<br />開出一張病人真的會用的處方。</h1>
            <p>選部位、回答幾個病史與理學檢查問題，逐步縮小到一個診斷；再挑 1–3 個核心動作與劑量。病人拿到的是含衛教、活動調整與回診時機的靜態處方頁，不含姓名或個資。</p>
          </div>

          <div className="builder-step">
            <StepHeading number={1} title="找出診斷" hint="症狀導引會逐題收斂；已經有診斷時可直接用診斷庫" />
            <div className="segmented segmented--mode" role="radiogroup" aria-label="找診斷的方式">
              <button type="button" role="radio" aria-checked={mode === 'symptom'} className={mode === 'symptom' ? 'is-selected' : ''} onClick={() => setMode('symptom')}>從症狀開始</button>
              <button type="button" role="radio" aria-checked={mode === 'library'} className={mode === 'library' ? 'is-selected' : ''} onClick={() => setMode('library')}>診斷庫（{conditions.length}）</button>
            </div>

            {mode === 'symptom' ? (
              <SymptomFlow
                adopted={condition}
                onAdopt={chooseCondition}
                onReopenScreening={() => {
                  if (!screenedInFlow) return
                  setSafety(null)
                  setScreenedInFlow(false)
                  invalidate()
                }}
              />
            ) : (
              <>
                <div className="diagnosis-picker">
                  <label className="diagnosis-search">
                    <Search size={18} aria-hidden="true" />
                    <input
                      type="search"
                      value={diagnosisQuery}
                      onChange={(event) => setDiagnosisQuery(event.target.value)}
                      placeholder="搜尋診斷、俗稱或部位"
                      aria-label="搜尋診斷、俗稱或部位"
                    />
                    {diagnosisQuery && <button type="button" onClick={() => setDiagnosisQuery('')} aria-label="清除搜尋"><X size={16} /></button>}
                  </label>
                  <div className="region-filters" role="group" aria-label="依部位篩選">
                    <button type="button" className={regionFilter === 'all' ? 'is-selected' : ''} aria-pressed={regionFilter === 'all'} onClick={() => setRegionFilter('all')}>全部</button>
                    {regions.map((region) => (
                      <button
                        type="button"
                        key={region.id}
                        className={regionFilter === region.id ? 'is-selected' : ''}
                        aria-pressed={regionFilter === region.id}
                        onClick={() => setRegionFilter(region.id)}
                      >{region.name}</button>
                    ))}
                  </div>
                </div>
                <div className="diagnosis-grid">
                  {filteredConditions.map((item) => (
                    <button
                      type="button"
                      className={`diagnosis-card ${condition === item.id ? 'is-selected' : ''}`}
                      key={item.id}
                      onClick={() => chooseCondition(item.id)}
                      aria-pressed={condition === item.id}
                    >
                      <ConditionIcon region={item.region} />
                      <span><b>{item.name}</b><small>{item.aka ?? item.hint}</small></span>
                      {condition === item.id && <CheckCircle2 className="diagnosis-card__check" />}
                    </button>
                  ))}
                  {!filteredConditions.length && <p className="diagnosis-empty">找不到相符項目；可換部位或縮短關鍵字。</p>}
                </div>
              </>
            )}
            <p className="diagnosis-boundary"><AlertTriangle size={15} />不在清單或診斷不確定時，請勿硬套最接近的項目；改提供一般活動與就醫建議。</p>
          </div>

          <div className={`builder-step ${condition ? '' : 'builder-step--muted'}`}>
            <StepHeading number={2} title="對準當下表現" hint={currentCondition?.stageHint ?? '先決定診斷後才會顯示分型'} />
            {!condition && <p className="step-empty">尚未選擇診斷。</p>}
            {condition && (
              <>
                {condition === 'low-back' && (
                  <div className="screening-box">
                    <div>
                      <b>走路症狀快篩</b>
                      <p>走一段路後，腳會麻、痛或無力；坐下或身體前彎就明顯改善嗎？</p>
                      <small>這是方向選擇快篩，不代表診斷。</small>
                    </div>
                    <div className="screening-box__choices" role="radiogroup" aria-label="走路症狀快篩">
                      <button type="button" role="radio" aria-checked={claudication === 'no'} className={claudication === 'no' ? 'is-selected' : ''} onClick={() => chooseClaudication('no')}>否／不符合</button>
                      <button type="button" role="radio" aria-checked={claudication === 'yes'} className={claudication === 'yes' ? 'is-alert' : ''} onClick={() => chooseClaudication('yes')}>是／符合</button>
                    </div>
                  </div>
                )}
                <div className="segmented" role="radiogroup" aria-label="臨床分型">
                  {conditionSubtypes.map((subtype) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={subtypeId === subtype.id}
                      className={subtypeId === subtype.id ? 'is-selected' : ''}
                      key={subtype.id}
                      disabled={subtype.id === 'back-extension' && claudication !== 'no'}
                      onClick={() => chooseSubtype(subtype.id)}
                    >{subtype.name}</button>
                  ))}
                </div>
                {claudication === 'yes' && (
                  <div className="clinical-note clinical-note--alert"><AlertTriangle size={18} /><span>可能有神經性跛行表現；已停用伸展方向。請依臨床評估使用一般活動，或改選「腰椎管狹窄」。</span></div>
                )}
                {currentSubtype && <div className="clinical-note"><Info size={18} /><span>{currentSubtype.description}</span></div>}
                {currentSubtype?.needsDirectionalConfirmation && (
                  <label className={`confirmation ${directionConfirmed ? 'is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={directionConfirmed}
                      onChange={(event) => { setDirectionConfirmed(event.target.checked); invalidate() }}
                    />
                    <span className="confirmation__box"><Check size={16} /></span>
                    <span><b>已確認方向偏好</b><small>重複動作後，症狀減輕或向腰部集中，而非往腿部延伸。</small></span>
                  </label>
                )}
                {currentCondition?.confirm && (
                  <label className={`confirmation confirmation--scope ${scopeConfirmed ? 'is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={scopeConfirmed}
                      onChange={(event) => { setScopeConfirmed(event.target.checked); invalidate() }}
                    />
                    <span className="confirmation__box"><Check size={16} /></span>
                    <span><b>{currentCondition.confirm.title}</b><small>{currentCondition.confirm.detail}</small></span>
                  </label>
                )}
              </>
            )}
          </div>

          <div className="builder-step safety-step">
            <StepHeading number={3} title="安全篩檢" hint="必須完成，才能產生 QR 處方" />
            {screenedInFlow && safety === 'safe' && (
              <div className="clinical-note"><ShieldCheck size={18} /><span>已在症狀導引的警訊篩檢中完成，且全部為否。若臨床上有新的疑慮，可在下方改為轉介。</span></div>
            )}
            <div className="safety-options" role="radiogroup" aria-label="安全篩檢結果">
              <button
                type="button"
                role="radio"
                aria-checked={safety === 'safe'}
                className={safety === 'safe' ? 'is-safe' : ''}
                onClick={() => { setSafety('safe'); invalidate() }}
              >
                <ShieldCheck /><span><b>可開立居家運動</b><small>已排除需立即轉介的警訊</small></span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={safety === 'refer'}
                className={safety === 'refer' ? 'is-refer' : ''}
                onClick={() => { setSafety('refer'); invalidate() }}
              >
                <AlertTriangle /><span><b>有警訊，先轉介</b><small>不產生運動處方</small></span>
              </button>
            </div>
            <p className="safety-helper">
              {currentCondition ? `例：${currentCondition.safetyHint}` : '例：'}
              快速惡化無力、重大外傷、發燒或全身性症狀。
            </p>
            {safety === 'refer' && (
              <div className="referral-block"><CircleStop /><span><b>目前不適合開立居家運動。</b>請依臨床判斷安排進一步評估或轉介。</span></div>
            )}
          </div>

          <div className={`builder-step ${safety !== 'safe' || !condition ? 'builder-step--muted' : ''}`}>
            <StepHeading number={4} title="留下最重要的 1–3 個動作" hint="已帶入建議組合；您仍可更換與調整劑量" />
            {!condition ? <p className="step-empty">尚未選擇診斷。</p> : (
              <>
                <div className="exercise-editor">
                  {selected.map((item, index) => {
                    const exercise = getExercise(item.id)!
                    return (
                      <article className="exercise-row" key={`${item.id}-${index}`}>
                        <span className="exercise-row__index">{index + 1}</span>
                        <ExerciseThumb id={item.id} />
                        <div className="exercise-row__body">
                          <div className="exercise-row__title">
                            <select value={item.id} onChange={(event) => updateExercise(index, event.target.value)} aria-label={`第 ${index + 1} 個動作`}>
                              {availableExercises.map((candidate) => (
                                <option
                                  value={candidate.id}
                                  key={candidate.id}
                                  disabled={candidate.id !== item.id && selected.some((selectedItem) => selectedItem.id === candidate.id)}
                                >{candidate.name}</option>
                              ))}
                            </select>
                            {selected.length > 1 && <button className="icon-button" type="button" onClick={() => removeExercise(index)} aria-label={`移除${exercise.name}`}><X size={18} /></button>}
                          </div>
                          <p>{exercise.summary}</p>
                          <DoseEditor dose={item.dose} onChange={(dose) => updateDose(index, dose)} />
                        </div>
                      </article>
                    )
                  })}
                </div>
                {selected.length < 3 && availableExercises.length > selected.length && (
                  <button className="text-button" type="button" onClick={addExercise}><Plus size={17} />再加一個動作</button>
                )}
                <EducationPreview condition={condition} />
              </>
            )}
          </div>
        </section>

        <aside className="preview-panel" aria-label="病人畫面預覽">
          <div className="preview-panel__heading">
            <div>
              <p className="eyebrow">病人手機預覽</p>
              <h2>{currentCondition ? `${currentCondition.name}・${currentSubtype?.name ?? ''}` : '尚未選擇診斷'}</h2>
            </div>
            <span>{selected.length} 個動作</span>
          </div>
          <div className="phone-preview">
            <div className="phone-preview__top"><Brand compact /><span>{new Date().toLocaleDateString('zh-TW')}</span></div>
            <div className="phone-preview__diagnosis">
              <small>今日運動處方</small>
              <b>{currentCondition?.name ?? '—'}</b>
              <span>{currentSubtype?.name ?? '待選擇'}</span>
            </div>
            <div className="phone-preview__list">
              {selected.map((item, index) => {
                const exercise = getExercise(item.id)!
                return (
                  <div className="mini-exercise" key={item.id}>
                    <span>{index + 1}</span>
                    <ExerciseThumb id={item.id} />
                    <div><b>{exercise.shortName}</b><small>{formatDose(item.dose)}</small></div>
                  </div>
                )
              })}
              {!selected.length && <p className="phone-preview__empty">選好診斷後會帶入建議動作。</p>}
            </div>
            <div className="phone-preview__sections">
              <span><BookOpen size={13} />衛教說明</span>
              <span><HeartPulse size={13} />活動調整建議</span>
              <span><Clock3 size={13} />回診與轉介時機</span>
            </div>
            <div className="phone-preview__safety"><ShieldCheck size={18} /><span><b>安全提醒</b><small>出現與今天評估不同的新麻木／無力，或症狀範圍擴大就停止。</small></span></div>
          </div>

          <div className="generate-area" ref={qrAreaRef}>
            {generatedUrl ? (
              <div className="qr-result" aria-live="polite">
                <div className="qr-result__code"><QRCodeSVG value={generatedUrl} size={172} level="M" marginSize={2} /></div>
                <div className="qr-result__copy"><span><CheckCircle2 size={18} />處方已產生</span><p>請病人用手機相機掃描。連結中不含姓名或個資。</p></div>
                <div className="qr-result__actions">
                  <a className="button button--primary" href={generatedUrl} target="_blank" rel="noreferrer">開啟病人版 <ExternalLink size={17} /></a>
                  <button className="button button--secondary" type="button" onClick={copyLink}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? '已複製' : '複製連結'}</button>
                  <button className="button button--quiet" type="button" onClick={() => window.print()}><Printer size={17} />列印紙本＋QR（義診建議）</button>
                </div>
                <p className="qr-result__fallback">網路不穩或病人不熟悉掃碼時，建議一併列印。</p>
              </div>
            ) : (
              <div>
                <button className="button button--generate" type="button" onClick={generate} disabled={!ready}>
                  <QrCode size={21} />產生 QR 處方
                </button>
                {!ready && <p className="generate-area__hint">{blockingHint}</p>}
              </div>
            )}
          </div>
        </aside>
      </main>

      {generatedUrl && currentCondition && (
        <section className="doctor-print-sheet" aria-label="紙本運動處方">
          <header>
            <Brand />
            <div>
              <QRCodeSVG value={generatedUrl} size={128} level="M" marginSize={2} />
              <small>掃描查看手機版</small>
            </div>
          </header>
          <div className="doctor-print-sheet__title">
            <p>居家運動處方・{new Date().toLocaleDateString('zh-TW')}</p>
            <h1>{currentCondition.name}｜{currentSubtype?.name}</h1>
            <span>請依醫師設定的次數與頻率練習，不必忍痛完成。</span>
            <div className="doctor-print-sheet__fields"><span>義診名稱：________________</span><span>醫師簽名：________________</span></div>
          </div>
          <div className="doctor-print-sheet__exercises">
            {selected.map((item, index) => {
              const exercise = getExercise(item.id)!
              return (
                <article key={item.id}>
                  <div className="doctor-print-sheet__exercise-head">
                    <span>{index + 1}</span>
                    {exercise.image && <img src={exercise.image} alt="" />}
                    <div><h2>{exercise.name}</h2><b>{formatDose(item.dose)}</b></div>
                  </div>
                  <ol>{exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  <p><b>提醒：</b>{exercise.keyCue}</p>
                </article>
              )
            })}
          </div>
          <div className="doctor-print-sheet__advice">
            <section>
              <h3>認識您的問題</h3>
              <p>{currentCondition.education.what}{currentCondition.education.course}</p>
            </section>
            <section>
              <h3>活動調整與生活建議</h3>
              <ul>{currentCondition.lifestyle.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section>
              <h3>回診與轉介時機</h3>
              <ul>{currentCondition.followUp.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>
          <footer>
            <b>停止並尋求評估：</b>尖銳痛；和今天醫師評估時不同的新麻木或無力；麻木範圍擴大、明顯加重；疼痛往手臂／小腿更遠處延伸；或隔天仍明顯惡化。胸口悶、喘不過氣或冒冷汗；大小便突然解不出來或失禁；會陰或大腿內側突然麻木；手或腳越來越沒力，請立即就醫。<br />
            本建議依當日簡易評估提供，非診斷，不取代完整檢查；症狀未改善或加重請至醫療院所就診。
          </footer>
        </section>
      )}
      <footer className="site-footer">本工具協助醫師傳遞當次運動建議，不取代後續臨床評估。</footer>
    </div>
  )
}

/** 病人端是一頁靜態處方：所有內容一次展開，沒有進度追蹤、計時器或互動流程。 */
function PatientPrescription({ prescription }: { prescription: Prescription }) {
  const allowed = new Set(exercisesFor(prescription.condition).map((exercise) => exercise.id))
  const items = prescription.exercises
    .map((selected) => ({ selected, exercise: getExercise(selected.id) }))
    .filter((item) => item.exercise && allowed.has(item.exercise.id))
  const subtype = getSubtype(prescription.subtype)
  const condition = getCondition(prescription.condition)
  const created = new Date(`${prescription.createdAt}T00:00:00`)
  const daysOld = Math.floor((Date.now() - created.getTime()) / 86_400_000)

  if (!items.length || !condition) return <InvalidPrescription />

  return (
    <div className="patient-app">
      <header className="patient-topbar"><Brand compact /><button type="button" onClick={() => window.print()}><Printer size={18} />列印</button></header>
      <main className="patient-main">
        <section className="patient-hero">
          <p className="eyebrow">您的居家運動處方</p>
          <h1>{condition.name}</h1>
          <div className="patient-hero__meta"><span>{subtype?.name ?? '個人化運動'}</span><span>開立日 {created.toLocaleDateString('zh-TW')}</span></div>
        </section>

        {daysOld > 14 && (
          <div className="stale-notice"><Clock3 /><span><b>這份處方已超過 14 天。</b>若疼痛位置、強度或活動能力有變化，請回原評估醫師或就近至復健科／骨科重新評估。</span></div>
        )}

        <section className="patient-exercises" aria-labelledby="exercise-list-title">
          <div className="section-title"><div><span>今天完成</span><h2 id="exercise-list-title">{items.length} 個核心動作</h2></div><small>照自己的速度，不必忍痛</small></div>
          {items.map(({ selected, exercise }, index) => {
            if (!exercise) return null
            return (
              <article className="patient-exercise" key={exercise.id}>
                <div className="patient-exercise__summary">
                  <span className="patient-exercise__number">{index + 1}</span>
                  <span className="patient-exercise__name"><b>{exercise.name}</b><small>{formatDose(selected.dose)}</small></span>
                </div>
                <div className="patient-exercise__details">
                  {exercise.image && <img className="exercise-hero-image" src={exercise.image} alt={`${exercise.name}動作示意`} />}
                  <ol className="instruction-list">
                    {exercise.steps.map((step, stepIndex) => <li key={step}><span>{stepIndex + 1}</span><p>{step}</p></li>)}
                  </ol>
                  <div className="key-cue"><Info size={19} /><span><b>記得</b>{exercise.keyCue}</span></div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="patient-block">
          <div className="patient-block__title"><BookOpen /><div><span>認識問題</span><h2>關於「{condition.name}」</h2></div></div>
          <dl className="patient-education">
            <div><dt>這是什麼</dt><dd>{condition.education.what}</dd></div>
            <div><dt>為什麼會這樣</dt><dd>{condition.education.why}</dd></div>
            <div><dt>大概會怎麼走</dt><dd>{condition.education.course}</dd></div>
            <div><dt>常見的誤解</dt><dd>{condition.education.myth}</dd></div>
          </dl>
        </section>

        <section className="patient-block">
          <div className="patient-block__title"><HeartPulse /><div><span>日常怎麼做</span><h2>活動調整與生活建議</h2></div></div>
          <ul className="patient-list">{condition.lifestyle.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="patient-block">
          <div className="patient-block__title"><Clock3 /><div><span>什麼時候要回來</span><h2>回診與轉介時機</h2></div></div>
          <ul className="patient-list">{condition.followUp.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="patient-safety">
          <div className="patient-safety__title"><ShieldCheck /><div><span>安全第一</span><h2>這些情況先停止</h2></div></div>
          <ul>
            <li>出現尖銳痛，或疼痛明顯增加且隔天仍未恢復。</li>
            <li>出現和今天醫師評估時不同的新麻木／無力，或麻木範圍擴大、明顯加重。</li>
            <li>疼痛往手臂／小腿更遠處延伸。</li>
          </ul>
          <div className="urgent-note">
            <AlertTriangle />
            <span>
              <b>有這些情形，停止運動並立即就醫</b>
              <ul>
                <li>胸口悶、喘不過氣或冒冷汗。</li>
                <li>大小便突然解不出來或失禁。</li>
                <li>會陰或大腿內側突然麻木。</li>
                <li>手或腳越來越沒力。</li>
                <li>重大外傷後疼痛，或發燒且越來越不舒服。</li>
              </ul>
            </span>
          </div>
        </section>

        <p className="patient-disclaimer">這份內容是本次看診的運動建議。第一次成功開啟後，網路不穩時仍可再次查看。若症狀改變、無法確定動作是否適合，請停止，並回原評估醫師或就近至復健科／骨科評估。</p>
      </main>
    </div>
  )
}

function InvalidPrescription() {
  return (
    <main className="invalid-state">
      <Brand />
      <AlertTriangle />
      <h1>這張處方無法開啟</h1>
      <p>連結可能不完整、版本較舊或已被修改，請向醫師重新取得 QR code。</p>
      <a className="button button--secondary" href={window.location.pathname}><ArrowLeft size={17} />回到醫師端</a>
    </main>
  )
}

export default function App() {
  const [doctorView, setDoctorView] = useState<DoctorView>(() => window.location.hash === '#pe' ? 'pe' : 'prescription')
  useEffect(() => {
    const syncView = () => {
      if (!window.location.hash.startsWith('#rx=')) setDoctorView(window.location.hash === '#pe' ? 'pe' : 'prescription')
    }
    window.addEventListener('hashchange', syncView)
    return () => window.removeEventListener('hashchange', syncView)
  }, [])

  const navigateDoctor = (view: DoctorView) => {
    setDoctorView(view)
    const next = view === 'pe' ? `${window.location.pathname}${window.location.search}#pe` : `${window.location.pathname}${window.location.search}`
    window.history.pushState(null, '', next)
  }

  const hashPayload = window.location.hash.startsWith('#rx=') ? window.location.hash.slice(4) : null
  const payload = hashPayload || new URLSearchParams(window.location.search).get('rx')
  if (!payload) return doctorView === 'pe'
    ? <PhysicalExam onNavigate={navigateDoctor} />
    : <DoctorBuilder onNavigate={navigateDoctor} />
  const prescription = decodePrescription(payload)
  return prescription ? <PatientPrescription prescription={prescription} /> : <InvalidPrescription />
}
