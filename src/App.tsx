import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleStop,
  Clock3,
  Copy,
  Dumbbell,
  ExternalLink,
  Footprints,
  Hand,
  Info,
  Minus,
  Pause,
  Play,
  Plus,
  Printer,
  QrCode,
  RefreshCcw,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { conditionName, conditions, exercises, getCondition, getExercise, getSubtype, regions, subtypes } from './data'
import { cloneDose, decodePrescription, formatDose, prescriptionUrl } from './lib/prescription'
import type { ConditionId, Dose, Prescription, RegionId, SelectedExercise } from './types'

const frequencies = ['每天 1 次', '每天 2 次', '每週 3 次', '每週 5 次'] as const

function localDateStamp(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? 'brand--compact' : ''}`} href={window.location.pathname} aria-label="回到動作處方首頁">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M11 28c8-1 12-6 15-17 8 6 11 13 8 21-3 8-15 10-23 3 8 0 14-4 18-10-5 4-10 5-18 3Z" />
          <circle cx="35" cy="13" r="4" />
        </svg>
      </span>
      <span><b>動作處方</b>{!compact && <small>復健科醫師的居家運動建議</small>}</span>
    </a>
  )
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
  if (region === 'upper-limb') return <Hand />
  if (region === 'hip-knee' || region === 'foot-ankle') return <Footprints />
  if (region === 'trunk') return <Dumbbell />
  return <Activity />
}

function makeSelection(subtypeId: string): SelectedExercise[] {
  const subtype = getSubtype(subtypeId)
  return (subtype?.presetIds ?? []).map((id) => ({ id, dose: cloneDose(getExercise(id)!.dose) }))
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

function DoctorBuilder() {
  const [condition, setCondition] = useState<ConditionId>('shoulder')
  const [regionFilter, setRegionFilter] = useState<RegionId | 'all'>('all')
  const [diagnosisQuery, setDiagnosisQuery] = useState('')
  const [subtypeId, setSubtypeId] = useState('shoulder-high')
  const [selected, setSelected] = useState<SelectedExercise[]>(() => makeSelection('shoulder-high'))
  const [safety, setSafety] = useState<'safe' | 'refer' | null>(null)
  const [claudication, setClaudication] = useState<'yes' | 'no' | null>(null)
  const [directionConfirmed, setDirectionConfirmed] = useState(false)
  const [scopeConfirmed, setScopeConfirmed] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const qrAreaRef = useRef<HTMLDivElement>(null)
  const currentCondition = getCondition(condition)
  const currentSubtype = getSubtype(subtypeId)!
  const conditionSubtypes = subtypes.filter((subtype) => subtype.condition === condition)
  const availableExercises = exercises.filter((exercise) => exercise.conditions.includes(condition)
    && !(claudication === 'yes' && ['press-up', 'standing-extension'].includes(exercise.id)))
  const normalizedQuery = diagnosisQuery.trim().toLocaleLowerCase('zh-TW')
  const filteredConditions = conditions.filter((item) => {
    const matchesRegion = regionFilter === 'all' || item.region === regionFilter
    const searchable = [item.name, item.hint, ...item.keywords].join(' ').toLocaleLowerCase('zh-TW')
    return matchesRegion && (!normalizedQuery || searchable.includes(normalizedQuery))
  })

  const currentPrescription: Prescription = useMemo(() => ({
    v: 1,
    condition,
    subtype: subtypeId,
    exercises: selected,
    createdAt: localDateStamp(),
    sourceVersion: '2026.08',
  }), [condition, subtypeId, selected])

  const ready = safety === 'safe'
    && selected.length >= 1
    && (condition !== 'low-back' || claudication !== null)
    && (condition !== 'achilles' || scopeConfirmed)
    && (!currentSubtype.needsDirectionalConfirmation || directionConfirmed)

  const invalidate = () => {
    setGeneratedUrl('')
    setCopied(false)
  }

  const chooseCondition = (next: ConditionId) => {
    const firstSubtype = subtypes.find((subtype) => subtype.condition === next)!
    setCondition(next)
    setSubtypeId(firstSubtype.id)
    setSelected(makeSelection(firstSubtype.id))
    setClaudication(null)
    setSafety(null)
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
      const hasExtensionExercise = selected.some((item) => ['press-up', 'standing-extension'].includes(item.id))
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
    if (!ready) return
    setGeneratedUrl(prescriptionUrl(currentPrescription))
    window.setTimeout(() => qrAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  const copyLink = async () => {
    if (!generatedUrl) return
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="app-shell doctor-app">
      <header className="topbar">
        <Brand />
        <div className="topbar__status"><span />義診快速開立模式</div>
      </header>

      <main className="builder-layout">
        <section className="builder" aria-label="運動處方設定">
          <div className="builder__intro">
            <p className="eyebrow"><Stethoscope size={16} /> 醫師端</p>
            <h1>在一分鐘內，開好一張<br />病人真的會用的運動處方。</h1>
            <p>從常見骨骼肌肉問題中選擇診斷與當下表現，再微調 1–3 個核心動作。處方不含姓名或個資。</p>
          </div>

          <div className="builder-step">
            <StepHeading number={1} title="選擇診斷" hint="可依部位篩選，或直接搜尋診斷與俗稱" />
            <div className="diagnosis-picker">
              <label className="diagnosis-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={diagnosisQuery}
                  onChange={(event) => setDiagnosisQuery(event.target.value)}
                  placeholder="搜尋診斷或部位"
                  aria-label="搜尋診斷或部位"
                />
                {diagnosisQuery && <button type="button" onClick={() => setDiagnosisQuery('')} aria-label="清除搜尋"><X size={16} /></button>}
              </label>
              <div className="region-filters" role="group" aria-label="依部位篩選">
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
                  <span><b>{item.name}</b><small>{item.hint}</small></span>
                  {condition === item.id && <CheckCircle2 className="diagnosis-card__check" />}
                </button>
              ))}
              {!filteredConditions.length && <p className="diagnosis-empty">找不到相符項目；可換部位或縮短關鍵字。</p>}
            </div>
            <p className="diagnosis-boundary"><AlertTriangle size={15} />不在清單或診斷不確定時，請勿硬套最接近的項目；改提供一般活動與就醫建議。</p>
          </div>

          <div className="builder-step">
            <StepHeading number={2} title="對準當下表現" hint={currentCondition.stageHint} />
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
            <div className="segmented" role="radiogroup" aria-label="臨床分類">
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
              <div className="clinical-note clinical-note--alert"><AlertTriangle size={18} /><span>可能有神經性跛行表現；已停用伸展方向。請依臨床評估使用一般活動或其他合適策略。</span></div>
            )}
            <div className="clinical-note"><Info size={18} /><span>{currentSubtype.description}</span></div>
            {currentSubtype.needsDirectionalConfirmation && (
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
            {condition === 'achilles' && (
              <label className={`confirmation confirmation--scope ${scopeConfirmed ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={scopeConfirmed}
                  onChange={(event) => { setScopeConfirmed(event.target.checked); invalidate() }}
                />
                <span className="confirmation__box"><Check size={16} /></span>
                <span><b>已確認為中段跟腱疼痛</b><small>壓痛主要在跟骨上方約 2–6 公分的腱體；非跟骨附著點、急性斷裂或部分撕裂疑慮。</small></span>
              </label>
            )}
          </div>

          <div className="builder-step safety-step">
            <StepHeading number={3} title="安全篩檢" hint="必須完成，才能產生 QR 處方" />
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
              例：{currentCondition.safetyHint}
              快速惡化無力、重大外傷、發燒或全身性症狀。
            </p>
            {safety === 'refer' && (
              <div className="referral-block"><CircleStop /><span><b>目前不適合開立居家運動。</b>請依臨床判斷安排進一步評估或轉介。</span></div>
            )}
          </div>

          <div className={`builder-step ${safety !== 'safe' ? 'builder-step--muted' : ''}`}>
            <StepHeading number={4} title="留下最重要的 1–3 個動作" hint="已帶入建議組合；您仍可更換與調整劑量" />
            <div className="exercise-editor">
              {selected.map((item, index) => {
                const exercise = getExercise(item.id)!
                return (
                  <article className="exercise-row" key={`${item.id}-${index}`}>
                    <span className="exercise-row__index">{index + 1}</span>
                    <img src={exercise.image} alt="" />
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
          </div>
        </section>

        <aside className="preview-panel" aria-label="病人畫面預覽">
          <div className="preview-panel__heading">
            <div><p className="eyebrow">病人手機預覽</p><h2>{conditionName(condition)}・{currentSubtype.name}</h2></div>
            <span>{selected.length} 個動作</span>
          </div>
          <div className="phone-preview">
            <div className="phone-preview__top"><Brand compact /><span>{new Date().toLocaleDateString('zh-TW')}</span></div>
            <div className="phone-preview__diagnosis"><small>今日運動處方</small><b>{conditionName(condition)}</b><span>{currentSubtype.name}</span></div>
            <div className="phone-preview__list">
              {selected.map((item, index) => {
                const exercise = getExercise(item.id)!
                return (
                  <div className="mini-exercise" key={item.id}>
                    <span>{index + 1}</span><img src={exercise.image} alt="" />
                    <div><b>{exercise.shortName}</b><small>{formatDose(item.dose)}</small></div>
                    <ChevronRight size={18} />
                  </div>
                )
              })}
            </div>
            <div className="phone-preview__safety"><ShieldCheck size={18} /><span><b>安全提醒</b><small>出現與今天評估不同的新麻木／無力，或症狀範圍擴大就停止。</small></span></div>
          </div>

          <div className="generate-area" ref={qrAreaRef}>
            {generatedUrl ? (
              <div className="qr-result" aria-live="polite">
                <div className="qr-result__code"><QRCodeSVG value={generatedUrl} size={164} level="M" marginSize={2} /></div>
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
                {!ready && (
                  <p className="generate-area__hint">
                    {condition === 'low-back' && claudication === null
                      ? '請先完成走路症狀快篩。'
                      : safety === null
                        ? '請先完成安全篩檢。'
                        : safety === 'refer'
                          ? '有警訊時不開立運動處方。'
                          : condition === 'achilles' && !scopeConfirmed
                            ? '請先確認中段跟腱的適用範圍。'
                            : '請先確認方向偏好。'}
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </main>
      {generatedUrl && (
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
            <h1>{conditionName(condition)}｜{currentSubtype.name}</h1>
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
                    <img src={exercise.image} alt="" />
                    <div><h2>{exercise.name}</h2><b>{formatDose(item.dose)}</b></div>
                  </div>
                  <ol>{exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  <p><b>提醒：</b>{exercise.keyCue}</p>
                </article>
              )
            })}
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

function PatientPrescription({ prescription }: { prescription: Prescription }) {
  const items = prescription.exercises
    .map((selected) => ({ selected, exercise: getExercise(selected.id) }))
    .filter((item) => item.exercise && item.exercise.conditions.includes(prescription.condition))
  const subtype = getSubtype(prescription.subtype)
  const timerSecondsFor = (index: number) => {
    const dose = items[index]?.selected.dose
    return dose?.type === 'duration' ? dose.minutes * 60 : 0
  }
  const [active, setActive] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [seconds, setSeconds] = useState(() => timerSecondsFor(0))
  const [running, setRunning] = useState(false)
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null)
  const timerNotifiedRef = useRef(false)

  const releaseWakeLock = async () => {
    if (!wakeLockRef.current) return
    try {
      await wakeLockRef.current.release()
    } catch {
      // The browser may already have released it when the screen was hidden.
    }
    wakeLockRef.current = null
  }

  const notifyTimerDone = () => {
    void releaseWakeLock()
    navigator.vibrate?.([150, 100, 150])
    try {
      const AudioContextClass = window.AudioContext
      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = 880
      gain.gain.setValueAtTime(0.08, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.28)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.28)
      oscillator.addEventListener('ended', () => { void context.close() }, { once: true })
    } catch {
      // Audio feedback is optional; the visual timer still completes.
    }
  }

  const toggleTimer = async () => {
    if (running) {
      setRunning(false)
      await releaseWakeLock()
      return
    }
    if (seconds === 0) {
      setSeconds(timerSecondsFor(active))
      timerNotifiedRef.current = false
    }
    const wakeLock = (navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> }
    }).wakeLock
    if (wakeLock) {
      try {
        wakeLockRef.current = await wakeLock.request('screen')
      } catch {
        // Unsupported or denied wake lock should not prevent timing.
      }
    }
    setRunning(true)
  }

  const resetTimer = () => {
    setSeconds(timerSecondsFor(active))
    setRunning(false)
    timerNotifiedRef.current = false
    void releaseWakeLock()
  }

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setRunning(false)
          if (!timerNotifiedRef.current) {
            timerNotifiedRef.current = true
            notifyTimerDone()
          }
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  useEffect(() => {
    setSeconds(timerSecondsFor(active))
    setRunning(false)
    timerNotifiedRef.current = false
    void releaseWakeLock()
  }, [active])

  useEffect(() => () => { void releaseWakeLock() }, [])

  const created = new Date(`${prescription.createdAt}T00:00:00`)
  const daysOld = Math.floor((Date.now() - created.getTime()) / 86_400_000)
  const completeActive = () => {
    setCompleted((values) => values.includes(active) ? values.filter((value) => value !== active) : [...values, active])
    if (active < items.length - 1) setActive(active + 1)
  }
  const activeItem = items[active]

  if (!items.length || !activeItem) return <InvalidPrescription />

  return (
    <div className="patient-app">
      <header className="patient-topbar"><Brand compact /><button type="button" onClick={() => window.print()}><Printer size={18} />列印</button></header>
      <main className="patient-main">
        <section className="patient-hero">
          <p className="eyebrow">您的居家運動處方</p>
          <h1>{conditionName(prescription.condition)}</h1>
          <div className="patient-hero__meta"><span>{subtype?.name ?? '個人化運動'}</span><span>開立日 {created.toLocaleDateString('zh-TW')}</span></div>
          <div className="progress-block" aria-label={`已完成 ${completed.length} 個，共 ${items.length} 個動作`}>
            <div><span>今日進度</span><b>{completed.length} / {items.length}</b></div>
            <div className="progress-track"><span style={{ width: `${completed.length / items.length * 100}%` }} /></div>
          </div>
        </section>

        {daysOld > 14 && (
          <div className="stale-notice"><Clock3 /><span><b>這份處方已超過 14 天。</b>若疼痛位置、強度或活動能力有變化，請回原評估醫師或就近至復健科／骨科重新評估。</span></div>
        )}

        <section className="patient-exercises" aria-labelledby="exercise-list-title">
          <div className="section-title"><div><span>今天完成</span><h2 id="exercise-list-title">{items.length} 個核心動作</h2></div><small>照自己的速度，不必忍痛</small></div>
          {items.map(({ selected, exercise }, index) => {
            if (!exercise) return null
            const expanded = active === index
            const done = completed.includes(index)
            return (
              <article className={`patient-exercise ${expanded ? 'is-active' : ''} ${done ? 'is-done' : ''}`} key={exercise.id}>
                <button className="patient-exercise__summary" type="button" onClick={() => setActive(index)} aria-expanded={expanded}>
                  <span className="patient-exercise__number">{done ? <Check size={18} /> : index + 1}</span>
                  <img src={exercise.image} alt={`${exercise.name}動作示意`} />
                  <span className="patient-exercise__name"><b>{exercise.name}</b><small>{formatDose(selected.dose)}</small></span>
                  <ChevronDown className="patient-exercise__chevron" />
                </button>
                {expanded && (
                  <div className="patient-exercise__details">
                    <img className="exercise-hero-image" src={exercise.image} alt={`${exercise.name}三步驟示意`} />
                    <ol className="instruction-list">
                      {exercise.steps.map((step, stepIndex) => <li key={step}><span>{stepIndex + 1}</span><p>{step}</p></li>)}
                    </ol>
                    <div className="key-cue"><Info size={19} /><span><b>記得</b>{exercise.keyCue}</span></div>
                    {selected.dose.type === 'duration' && (
                      <div className="timer-card">
                        <div className="timer-card__time"><small>這個動作用分鐘算・結束會震動／提示音</small><b>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</b></div>
                        <div className="timer-card__controls">
                          <button type="button" onClick={() => { void toggleTimer() }}>{running ? <Pause /> : <Play />}{running ? '暫停' : seconds === 0 ? '再一次' : '開始計時'}</button>
                          <button type="button" onClick={resetTimer} aria-label="重設計時"><RefreshCcw /></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
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

      <div className="patient-sticky-action">
        <button type="button" onClick={completeActive}>
          {completed.includes(active) ? '取消完成標記' : active < items.length - 1 ? '完成，前往下一個' : '完成最後一個動作'}
          {!completed.includes(active) && <ChevronRight />}
        </button>
      </div>
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
  const hashPayload = window.location.hash.startsWith('#rx=') ? window.location.hash.slice(4) : null
  const payload = hashPayload || new URLSearchParams(window.location.search).get('rx')
  if (!payload) return <DoctorBuilder />
  const prescription = decodePrescription(payload)
  return prescription ? <PatientPrescription prescription={prescription} /> : <InvalidPrescription />
}
