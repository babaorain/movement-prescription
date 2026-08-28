import type { Condition, ConditionId, FlowStep, RegionId, Subtype } from '../types'
import { neckConditions, neckSubtypes } from './conditions/neck'
import { shoulderConditions, shoulderSubtypes } from './conditions/shoulder'
import { armConditions, armSubtypes } from './conditions/arm'
import { spineConditions, spineSubtypes } from './conditions/spine'
import { hipConditions, hipSubtypes } from './conditions/hip'
import { kneeConditions, kneeSubtypes } from './conditions/knee'
import { footConditions, footSubtypes } from './conditions/foot'
import { upperFlow } from './flows/upper'
import { lowerFlow } from './flows/lower'
import { exercises } from './exercises'

export { regions, regionName } from './regions'
export { exercises, getExercise } from './exercises'

export const conditions: Condition[] = [
  ...neckConditions,
  ...shoulderConditions,
  ...armConditions,
  ...spineConditions,
  ...hipConditions,
  ...kneeConditions,
  ...footConditions,
]

export const subtypes: Subtype[] = [
  ...neckSubtypes,
  ...shoulderSubtypes,
  ...armSubtypes,
  ...spineSubtypes,
  ...hipSubtypes,
  ...kneeSubtypes,
  ...footSubtypes,
]

export const flowSteps: FlowStep[] = [...upperFlow, ...lowerFlow]

const conditionById = new Map(conditions.map((condition) => [condition.id, condition]))
const subtypeById = new Map(subtypes.map((subtype) => [subtype.id, subtype]))
const flowStepById = new Map(flowSteps.map((step) => [step.id, step]))

/**
 * 分型短碼由診斷短碼加上它在該診斷中的順序組成，因此不需要另一張手維護的對照表。
 * 已發出的 QR 依賴這個順序：新增分型請加在該診斷的既有分型之後。
 */
const subtypeCodeById = new Map<string, string>()
const seenPerCondition = new Map<ConditionId, number>()
for (const subtype of subtypes) {
  const index = (seenPerCondition.get(subtype.condition) ?? 0) + 1
  seenPerCondition.set(subtype.condition, index)
  subtypeCodeById.set(subtype.id, `${conditionById.get(subtype.condition)?.code ?? '??'}${index.toString(36)}`)
}

export const getCondition = (id: ConditionId) => conditionById.get(id)!
export const conditionName = (id: ConditionId) => conditionById.get(id)?.name ?? ''
export const getSubtype = (id: string) => subtypeById.get(id)
export const getFlowStep = (id: string) => flowStepById.get(id)
export const subtypeCode = (id: string) => subtypeCodeById.get(id)

export const subtypesFor = (condition: ConditionId) => subtypes.filter((subtype) => subtype.condition === condition)

export const conditionsIn = (region: RegionId | 'all') => region === 'all'
  ? conditions
  : conditions.filter((condition) => condition.region === region)

/** 症狀導引的起點：每個部位的警訊篩檢。 */
export const flowEntryFor = (region: RegionId) => flowSteps
  .find((step) => step.region === region && step.kind === 'redflag')

/** 醫師可替換的動作：同部位、且未被該診斷標記為不適用。 */
export const exercisesFor = (condition: ConditionId) => {
  const region = conditionById.get(condition)?.region
  if (!region) return []
  return exercises.filter((exercise) => exercise.regions.includes(region)
    && !exercise.avoidFor?.includes(condition))
}
