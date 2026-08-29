import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  Info,
  ListOrdered,
  Minus,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Timer,
  X,
} from 'lucide-react'
import { peRegions, peSources } from '../data/physical-exams'
import type { PeDiagnosis, PeRegionId, PeResult, PeSource, PeTest } from '../types'
import { DoctorTopbar, type DoctorView } from './DoctorTopbar'

type ExamMode = 'quick' | 'full'
type ScopeStatus = 'pending' | 'eligible' | 'excluded'

const categoryLabels: Record<PeTest['category'], string> = {
  screen: '安全／來源篩檢',
  motion: '活動度',
  neuro: '神經學',
  special: '特殊檢查',
  functional: '功能測試',
}

const evidenceLabels = {
  high: '高確定性',
  moderate: '中等確定性',
  low: '低確定性',
  'very-low': '極低確定性',
  unavailable: '證據不足',
} as const

const exclusions = [
  { id: 'acute-trauma', label: '重大急性外傷', detail: '近期高能量創傷、明顯變形、疑似骨折／脫位或無法安全負重' },
  { id: 'pediatric', label: '兒童／青少年', detail: '目前版本限定成人常見肌骨問題' },
  { id: 'postop', label: '術後／有明確手術限制', detail: '應依術式、時間軸與手術團隊 protocol 評估' },
  { id: 'primary-neuro', label: '疑似原發神經疾病', detail: '非單一肌骨／神經根問題，或已有中樞／周邊神經疾病主導表現' },
] as const

function positiveWeight(test: PeTest): number {
  const value = test.accuracy.specificityValue
  if (value === undefined) return .75
  if (value >= .90) return 3
  if (value >= .75) return 2
  if (value >= .60) return 1.5
  return 1
}

function negativeWeight(test: PeTest): number {
  const value = test.accuracy.sensitivityValue
  if (value === undefined) return -.5
  if (value >= .90) return -3
  if (value >= .75) return -2
  if (value >= .60) return -1.5
  return -1
}

function supportLabel(score: number, positives: number): string {
  if (!positives && score === 0) return '尚無資料'
  if (score >= 5) return '較高支持'
  if (score >= 2) return '有支持'
  if (score > 0) return '些微支持'
  if (score < 0) return '支持下降'
  return '未改變'
}

function resultLabel(result: PeResult | undefined): string {
  if (result === 'positive') return '陽性'
  if (result === 'negative') return '陰性'
  return '未做'
}

function SourceEvidence({ source }: { source: PeSource }) {
  if (!source.takeaways?.length) {
    return (
      <div className="pe-source pe-source--unavailable">
        <span><b>{source.label}</b><small>{evidenceLabels[source.evidence]}・{source.context}</small></span>
      </div>
    )
  }

  return (
    <section className="pe-source-note" aria-label={`${source.label}站內研究摘要`}>
      <div className="pe-source-note__heading">
        <BookOpen aria-hidden="true" />
        <span>
          <small>站內研究重點・{evidenceLabels[source.evidence]}</small>
          <b>{source.label}</b>
        </span>
      </div>
      <dl className="pe-source-note__meta">
        {source.design && <div><dt>設計</dt><dd>{source.design}</dd></div>}
        {source.sample && <div><dt>樣本</dt><dd>{source.sample}</dd></div>}
      </dl>
      <ul>
        {source.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
      </ul>
      {source.limitations && <p className="pe-source-note__limits"><AlertTriangle aria-hidden="true" /><span><b>外推限制</b>{source.limitations}</span></p>}
      <div className="pe-source-note__footer">
        <small>中文重點依研究摘要整理，非逐字翻譯；數值須連同研究族群與 reference standard 判讀。</small>
        {source.url && <a href={source.url} target="_blank" rel="noreferrer">核對原文 <ExternalLink aria-hidden="true" /></a>}
      </div>
    </section>
  )
}

export function PhysicalExam({ onNavigate }: { onNavigate: (view: DoctorView) => void }) {
  const [scopeStatus, setScopeStatus] = useState<ScopeStatus>('pending')
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([])
  const [mode, setMode] = useState<ExamMode>('quick')
  const [regionId, setRegionId] = useState<PeRegionId>('shoulder')
  const [results, setResults] = useState<Record<string, PeResult>>({})
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({})

  const region = peRegions.find((item) => item.id === regionId) ?? peRegions[0]
  const visibleTests = mode === 'quick' ? region.tests.filter((test) => test.quick) : region.tests
  const answered = visibleTests.filter((test) => results[test.id] && results[test.id] !== 'not-done').length

  const ranked = useMemo(() => {
    const rows = region.diagnoses.map((diagnosis) => ({
      diagnosis,
      score: 0,
      positives: [] as string[],
      negatives: [] as string[],
    }))
    const byId = new Map(rows.map((row) => [row.diagnosis.id, row]))

    for (const test of region.tests) {
      const result = results[test.id]
      if (!result || result === 'not-done') continue
      for (const target of test.targets) {
        const row = byId.get(target)
        if (!row) continue
        if (result === 'positive') {
          const urgentBoost = row.diagnosis.urgent ? 1 : 0
          row.score += positiveWeight(test) + urgentBoost
          row.positives.push(test.name)
        } else {
          row.score += negativeWeight(test)
          row.negatives.push(test.name)
        }
      }
    }

    return rows.sort((a, b) => {
      const urgentDifference = Number(b.diagnosis.urgent && b.positives.length > 0) - Number(a.diagnosis.urgent && a.positives.length > 0)
      return urgentDifference || b.score - a.score || b.positives.length - a.positives.length
    })
  }, [region, results])

  const setTestResult = (testId: string, result: PeResult) => {
    setResults((current) => ({ ...current, [testId]: result }))
  }

  const selectRegion = (next: PeRegionId) => {
    setRegionId(next)
    document.querySelector('.pe-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleExclusion = (id: string) => {
    setSelectedExclusions((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      setScopeStatus(next.length ? 'excluded' : 'pending')
      return next
    })
  }

  const markEligible = () => {
    setSelectedExclusions([])
    setScopeStatus('eligible')
  }

  const resetScope = () => {
    setScopeStatus('pending')
    setSelectedExclusions([])
    setResults({})
  }

  return (
    <div className={`app-shell pe-app ${scopeStatus === 'eligible' ? 'pe-app--ready' : ''}`}>
      <DoctorTopbar active="pe" onNavigate={onNavigate} />
      <main className="pe-page">
        <section className="pe-hero">
          <div>
            <p className="eyebrow"><Stethoscope aria-hidden="true" /> 醫師端・成人非術後肌骨</p>
            <h1>理學檢查與鑑別診斷工作台</h1>
            <p>用 60–90 秒完成義診必要快篩，或展開 3–5 分鐘完整核心檢查。每項測試都附陽性意義、敏感度、特異度與研究限制。</p>
          </div>
          <div className="pe-hero__meta" aria-label="內容範圍">
            <div><b>{peRegions.length}</b><span>個部位</span></div>
            <div><b>{peRegions.reduce((sum, item) => sum + item.tests.length, 0)}</b><span>項核心 PE</span></div>
            <div><b>2</b><span>種檢查深度</span></div>
          </div>
        </section>

        <section className={`scope-gate ${scopeStatus === 'eligible' ? 'scope-gate--done' : ''}`} aria-labelledby="scope-title">
          <div className="scope-gate__heading">
            <span className="scope-gate__number">0</span>
            <div>
              <p>開始前先排除</p>
              <h2 id="scope-title">這個病例在本工具的適用範圍內嗎？</h2>
            </div>
            {scopeStatus === 'eligible' && <button type="button" className="scope-gate__reset" onClick={resetScope}><RotateCcw />重設</button>}
          </div>

          {scopeStatus === 'eligible' ? (
            <div className="scope-clear"><ShieldCheck /><span><b>已確認：以上皆無</b><small>成人、非重大急性外傷、非術後，且不是原發神經疾病主導。</small></span></div>
          ) : (
            <>
              <div className="scope-options">
                {exclusions.map((item) => {
                  const selected = selectedExclusions.includes(item.id)
                  return (
                    <button type="button" key={item.id} className={selected ? 'is-selected' : ''} aria-pressed={selected} onClick={() => toggleExclusion(item.id)}>
                      <span className="scope-options__box">{selected && <Check />}</span>
                      <span><b>{item.label}</b><small>{item.detail}</small></span>
                    </button>
                  )
                })}
              </div>
              <button type="button" className="scope-enter" onClick={markEligible}><ShieldCheck />以上皆無，進入 PE</button>
              {scopeStatus === 'excluded' && (
                <div className="scope-referral" role="alert">
                  <AlertTriangle />
                  <span><b>目前不套用這套 PE／DD 流程</b><small>請改走急性外傷、兒科、術後 protocol 或正式神經學評估；不要用下方支持度排序取代該路徑。</small></span>
                </div>
              )}
            </>
          )}
        </section>

        {scopeStatus === 'eligible' && (
          <>
            <section className="pe-controls" aria-label="選擇檢查方式與部位">
              <div className="pe-mode" role="radiogroup" aria-label="檢查深度">
                <button type="button" role="radio" aria-checked={mode === 'quick'} className={mode === 'quick' ? 'is-selected' : ''} onClick={() => setMode('quick')}>
                  <Timer /><span><b>快速 60–90 秒</b><small>義診必要檢查</small></span>
                </button>
                <button type="button" role="radio" aria-checked={mode === 'full'} className={mode === 'full' ? 'is-selected' : ''} onClick={() => setMode('full')}>
                  <BookOpen /><span><b>完整 3–5 分鐘</b><small>核心 DD 組合</small></span>
                </button>
              </div>
              <div className="pe-regions" role="tablist" aria-label="疼痛部位">
                {peRegions.map((item) => (
                  <button type="button" role="tab" aria-selected={item.id === regionId} className={item.id === regionId ? 'is-selected' : ''} key={item.id} onClick={() => selectRegion(item.id)}>
                    <Activity aria-hidden="true" />{item.shortName}
                  </button>
                ))}
              </div>
            </section>

            <div className="pe-workspace">
              <section className="pe-exam" aria-labelledby="pe-region-title">
                <div className="pe-exam__heading">
                  <div>
                    <p className="eyebrow">{mode === 'quick' ? '義診快速序列' : '完整核心序列'}</p>
                    <h2 id="pe-region-title">{region.name}</h2>
                    <p>{region.hint}</p>
                  </div>
                  <div className="pe-progress" aria-label={`已完成 ${answered} / ${visibleTests.length}`}>
                    <span><b>{answered}</b>／{visibleTests.length}</span>
                    <div><i style={{ width: `${visibleTests.length ? answered / visibleTests.length * 100 : 0}%` }} /></div>
                    <small>已判讀</small>
                  </div>
                </div>

                <div className="pe-sequence-note"><Info /><span>建議依序完成。<b>Sn 高的陰性結果</b>較能降低可能性，<b>Sp 高的陽性結果</b>較能增加支持度；數字不會把 pre-test probability 自動變成診斷。</span></div>

                <figure className="pe-region-visual">
                  <div className="pe-region-visual__image">
                    <img src={region.illustration.src} alt={region.illustration.alt} decoding="async" />
                  </div>
                  <figcaption>
                    <span><small>原創臨床示意・操作仍以文字為準</small><b>{region.illustration.title}</b></span>
                    <p>{region.illustration.caption}</p>
                  </figcaption>
                </figure>

                <div className="pe-test-list">
                  {visibleTests.map((test, index) => {
                    const source = peSources[test.sourceId]
                    const result = results[test.id]
                    return (
                      <article className={`pe-test ${result ? `pe-test--${result}` : ''}`} key={test.id}>
                        <details
                          open={expandedTests[test.id] ?? index === 0}
                          onToggle={(event) => {
                            const open = event.currentTarget.open
                            setExpandedTests((current) => current[test.id] === open ? current : { ...current, [test.id]: open })
                          }}
                        >
                          <summary>
                            <span className="pe-test__index">{index + 1}</span>
                            <span className="pe-test__title">
                              <small>{categoryLabels[test.category]}</small>
                              <b>{test.name}</b>
                              {test.nameEn && <em>{test.nameEn}</em>}
                            </span>
                            <span className="pe-test__metrics"><i>Sn <b>{test.accuracy.sensitivity}</b></i><i>Sp <b>{test.accuracy.specificity}</b></i></span>
                            <span className={`pe-test__current ${result ?? ''}`}>{resultLabel(result)}</span>
                            <ChevronDown className="pe-test__chevron" aria-hidden="true" />
                          </summary>
                          <div className="pe-test__body">
                            <dl>
                              <div><dt>怎麼做</dt><dd>{test.method}</dd></div>
                              <div><dt>何謂陽性</dt><dd>{test.positive}</dd></div>
                              <div className="pe-test__meaning"><dt>陽性代表</dt><dd>{test.positiveMeans}</dd></div>
                            </dl>
                            <div className="accuracy-panel">
                              <div><span>敏感度</span><b>{test.accuracy.sensitivity}</b></div>
                              <div><span>特異度</span><b>{test.accuracy.specificity}</b></div>
                              <p>{test.accuracy.note ?? source.context}</p>
                            </div>
                            {test.caution && <p className="pe-test__caution"><AlertTriangle />{test.caution}</p>}
                            <SourceEvidence source={source} />
                          </div>
                        </details>
                        <div className="pe-test__actions" role="group" aria-label={`${test.name}結果`}>
                          <button type="button" className={result === 'positive' ? 'is-positive' : ''} aria-pressed={result === 'positive'} onClick={() => setTestResult(test.id, 'positive')}><Check />陽性</button>
                          <button type="button" className={result === 'negative' ? 'is-negative' : ''} aria-pressed={result === 'negative'} onClick={() => setTestResult(test.id, 'negative')}><X />陰性</button>
                          <button type="button" className={result === 'not-done' ? 'is-skipped' : ''} aria-pressed={result === 'not-done'} onClick={() => setTestResult(test.id, 'not-done')}><Minus />未做</button>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {mode === 'quick' && (
                  <button type="button" className="pe-expand-full" onClick={() => setMode('full')}><BookOpen />再做 {region.tests.length - visibleTests.length} 項，切換完整檢查</button>
                )}
              </section>

              <aside className="dd-panel" aria-labelledby="dd-title">
                <div className="dd-panel__heading">
                  <p className="eyebrow"><ListOrdered /> 即時更新</p>
                  <h2 id="dd-title">DD 支持度排序</h2>
                  <p>依目前勾選的陽性／陰性結果排序，未輸入的檢查不影響排名。</p>
                </div>

                <ol className="dd-list">
                  {ranked.map((row, index) => (
                    <li className={`${row.diagnosis.urgent && row.positives.length ? 'is-urgent' : ''} ${row.score < 0 ? 'is-lower' : ''}`} key={row.diagnosis.id}>
                      <span className="dd-list__rank">{index + 1}</span>
                      <div>
                        <span className="dd-list__name"><b>{row.diagnosis.name}</b>{row.diagnosis.urgent && <em>先排除</em>}</span>
                        <small>{supportLabel(row.score, row.positives.length)}</small>
                        {row.positives.length > 0 && <p><b>支持：</b>{row.positives.join('、')}</p>}
                        {row.negatives.length > 0 && <p><b>反對：</b>{row.negatives.join('、')}</p>}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="dd-disclaimer"><AlertTriangle /><span><b>支持度不是機率，也不是診斷。</b>排序只用來整理 DD；須結合病史、pre-test probability、完整神經學、影像／檢驗需求與醫師判斷。單一測試不可獨立確診。</span></div>
                <button type="button" className="dd-reset" onClick={() => setResults({})} disabled={!Object.keys(results).length}><RotateCcw />清除全部判讀</button>
              </aside>
            </div>
          </>
        )}
      </main>
      <footer className="site-footer">PE 數值依特定研究族群與參考標準而定；請點開來源與限制，不可直接視為所有病人的固定表現。</footer>
    </div>
  )
}
