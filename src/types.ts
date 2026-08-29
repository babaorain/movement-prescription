export type RegionId = 'neck' | 'shoulder' | 'elbow-hand' | 'spine' | 'hip' | 'knee' | 'foot-ankle'

export type ConditionId =
  // 頸部
  | 'neck-pain'
  | 'cervical-radiculopathy'
  | 'cervicogenic-headache'
  | 'whiplash'
  | 'myofascial-neck'
  | 'tmj'
  | 'thoracic-outlet'
  // 肩部
  | 'shoulder'
  | 'rotator-cuff'
  | 'rotator-cuff-tear'
  | 'calcific-tendinitis'
  | 'biceps-tendinopathy'
  | 'ac-joint'
  | 'shoulder-instability'
  | 'scapular-dyskinesis'
  // 肘腕手
  | 'lateral-elbow'
  | 'medial-elbow'
  | 'cubital-tunnel'
  | 'carpal-tunnel'
  | 'dequervain'
  | 'trigger-finger'
  | 'thumb-cmc-oa'
  | 'hand-oa'
  | 'tfcc'
  | 'distal-radius-recovery'
  // 胸腰背
  | 'low-back'
  | 'lumbar-radiculopathy'
  | 'lumbar-stenosis'
  | 'facet-pain'
  | 'si-joint'
  | 'spondylolisthesis'
  | 'vertebral-fracture'
  | 'thoracic-pain'
  | 'axial-spa'
  // 髖與骨盆
  | 'hip-oa'
  | 'gtps'
  | 'fai'
  | 'adductor-strain'
  | 'hamstring-tendinopathy'
  | 'deep-gluteal'
  | 'post-hip-replacement'
  // 膝
  | 'knee-oa'
  | 'patellofemoral'
  | 'patellar-tendinopathy'
  | 'meniscus-degenerative'
  | 'mcl-sprain'
  | 'acl-recovery'
  | 'pes-anserine'
  | 'itbs'
  | 'post-knee-replacement'
  // 足踝小腿
  | 'ankle-sprain'
  | 'chronic-ankle-instability'
  | 'plantar-heel'
  | 'achilles'
  | 'insertional-achilles'
  | 'peroneal-tendinopathy'
  | 'tibialis-posterior'
  | 'mtss'
  | 'metatarsalgia'
  | 'hallux-valgus'
  | 'ankle-oa'

export type Frequency = '每天 1 次' | '每天 2 次' | '每天 3 次' | '每週 3 次' | '每週 5 次'

export type RepetitionDose = {
  type: 'reps'
  reps: number
  sets: number
  frequency: Frequency
}

export type DurationDose = {
  type: 'duration'
  minutes: number
  frequency: Frequency
}

export type Dose = RepetitionDose | DurationDose

/** 病人端與紙本共用的衛教文案。四段都是白話，避免術語。 */
export type Education = {
  what: string
  why: string
  course: string
  myth: string
}

export type Condition = {
  id: ConditionId
  /** 網址短碼；必須全域唯一，變更會讓已發出的 QR 失效。 */
  code: string
  name: string
  /** 俗稱或英文簡稱，顯示在診斷卡第二行。 */
  aka?: string
  hint: string
  region: RegionId
  keywords: string[]
  stageHint: string
  /** 醫師端安全篩檢的補充例子，接在通用警訊之前。 */
  safetyHint: string
  education: Education
  /** 活動調整與生活建議。 */
  lifestyle: string[]
  /** 回診與轉介時機。 */
  followUp: string[]
  /** 開立前醫師必須勾選的適用邊界。 */
  confirm?: { title: string; detail: string }
}

export type Exercise = {
  id: string
  /** 網址短碼；必須全域唯一。 */
  code: string
  name: string
  shortName: string
  /** 對應 public/exercises 的線稿圖；沒有相符圖像時留空，改以步驟文字呈現。 */
  image?: string
  summary: string
  steps: [string, string, string]
  keyCue: string
  dose: Dose
  /** 可在哪些部位的處方中被選用。 */
  regions: RegionId[]
  /** 對特定診斷不適用，選單中會隱藏。 */
  avoidFor?: ConditionId[]
}

export type Subtype = {
  id: string
  condition: ConditionId
  name: string
  description: string
  presetIds: string[]
  needsDirectionalConfirmation?: boolean
}

/** 症狀導引每一步的去向。 */
export type FlowTarget =
  | { kind: 'step'; id: string }
  | { kind: 'condition'; id: ConditionId; note?: string }
  | { kind: 'refer'; title: string; detail: string }

export type FlowOption = {
  label: string
  detail?: string
  target: FlowTarget
}

export type FlowStep = {
  id: string
  region: RegionId
  /** redflag：警訊複選；history：病史問答；exam：理學檢查。 */
  kind: 'redflag' | 'history' | 'exam'
  title: string
  detail?: string
  /** exam 專用：怎麼做這個測試。 */
  method?: string
  /** history / exam 的選項。 */
  options?: FlowOption[]
  /** redflag 專用：勾選任一項就轉介。 */
  flags?: string[]
  /** redflag 專用：皆無時的去向。 */
  clear?: FlowTarget
  referTitle?: string
  referDetail?: string
}

export type SelectedExercise = {
  id: string
  dose: Dose
}

export type Prescription = {
  v: 2
  condition: ConditionId
  subtype: string
  exercises: SelectedExercise[]
  createdAt: string
  sourceVersion: string
}

export type PeRegionId =
  | 'cervical'
  | 'shoulder'
  | 'elbow'
  | 'wrist-hand'
  | 'thoracic'
  | 'lumbar'
  | 'hip'
  | 'knee'
  | 'ankle-foot'

export type PeCategory = 'screen' | 'motion' | 'neuro' | 'special' | 'functional'

export type PeEvidenceLevel = 'high' | 'moderate' | 'low' | 'very-low' | 'unavailable'

export type PeSource = {
  id: string
  label: string
  url?: string
  evidence: PeEvidenceLevel
  context: string
  /** 研究設計與納入來源，供卡片內直接閱讀。 */
  design?: string
  /** 研究樣本或臨床族群；摘要未提供時明確標示。 */
  sample?: string
  /** 以繁體中文轉述的主要結果，不複製受版權保護的原文。 */
  takeaways?: string[]
  /** 會影響外推或判讀的主要限制。 */
  limitations?: string
}

export type PeIllustration = {
  src: string
  alt: string
  title: string
  caption: string
}

export type PeAccuracy = {
  /** 顯示用字串；研究不足時固定使用「無穩定估計」。 */
  sensitivity: string
  specificity: string
  /** DD 支持度排序用；只有可合理抽取的點估計才填。 */
  sensitivityValue?: number
  specificityValue?: number
  note?: string
}

export type PeTest = {
  id: string
  name: string
  nameEn?: string
  category: PeCategory
  /** 快速模式收錄；完整模式會收錄該部位全部檢查。 */
  quick: boolean
  method: string
  positive: string
  positiveMeans: string
  targets: string[]
  accuracy: PeAccuracy
  sourceId: string
  caution?: string
}

export type PeDiagnosis = {
  id: string
  name: string
  conditionId?: ConditionId
  urgent?: boolean
}

export type PeRegion = {
  id: PeRegionId
  name: string
  shortName: string
  hint: string
  illustration: PeIllustration
  diagnoses: PeDiagnosis[]
  tests: PeTest[]
}

export type PeResult = 'positive' | 'negative' | 'not-done'
