import { conditions, exercises, exercisesFor, flowSteps, getCondition, regions, subtypeCode, subtypes } from '../data'
import { peRegions, peSources } from '../data/physical-exams'
import type { ConditionId } from '../types'

/**
 * 開發模式的資料完整性檢查。診斷庫夠大之後，靠肉眼很難發現
 * 「分型指到不存在的動作」或「短碼撞號」這類錯誤，這些錯誤會直接讓病人拿到壞掉的 QR。
 */
export function validateData(): string[] {
  const problems: string[] = []
  const duplicates = (label: string, values: string[]) => {
    const seen = new Set<string>()
    for (const value of values) {
      if (seen.has(value)) problems.push(`${label}重複：${value}`)
      seen.add(value)
    }
  }

  duplicates('診斷 id', conditions.map((condition) => condition.id))
  duplicates('診斷短碼', conditions.map((condition) => condition.code))
  duplicates('動作 id', exercises.map((exercise) => exercise.id))
  duplicates('動作短碼', exercises.map((exercise) => exercise.code))
  duplicates('分型 id', subtypes.map((subtype) => subtype.id))
  duplicates('分型短碼', subtypes.map((subtype) => subtypeCode(subtype.id) ?? subtype.id))
  duplicates('流程步驟 id', flowSteps.map((step) => step.id))
  duplicates('PE 部位 id', peRegions.map((region) => region.id))
  duplicates('PE 測試 id', peRegions.flatMap((region) => region.tests.map((test) => test.id)))

  for (const code of [...conditions.map((c) => c.code), ...exercises.map((e) => e.code)]) {
    if (/[.~-]/.test(code)) problems.push(`短碼不可包含網址分隔字元：${code}`)
  }

  const exerciseIds = new Set(exercises.map((exercise) => exercise.id))
  const conditionIds = new Set<string>(conditions.map((condition) => condition.id))
  const stepIds = new Set(flowSteps.map((step) => step.id))

  for (const condition of conditions) {
    const own = subtypes.filter((subtype) => subtype.condition === condition.id)
    if (!own.length) problems.push(`診斷沒有任何分型：${condition.id}`)
    if (!exercisesFor(condition.id).length) problems.push(`診斷沒有任何可選動作：${condition.id}`)
  }

  for (const subtype of subtypes) {
    if (!conditionIds.has(subtype.condition)) {
      problems.push(`分型指向不存在的診斷：${subtype.id} → ${subtype.condition}`)
      continue
    }
    if (subtype.presetIds.length < 1 || subtype.presetIds.length > 3) {
      problems.push(`分型的預設動作必須是 1–3 個：${subtype.id}`)
    }
    if (new Set(subtype.presetIds).size !== subtype.presetIds.length) {
      problems.push(`分型的預設動作重複：${subtype.id}`)
    }
    const allowed = new Set(exercisesFor(subtype.condition).map((exercise) => exercise.id))
    for (const id of subtype.presetIds) {
      if (!exerciseIds.has(id)) problems.push(`分型指向不存在的動作：${subtype.id} → ${id}`)
      else if (!allowed.has(id)) problems.push(`預設動作不在該診斷的可選清單中：${subtype.id} → ${id}`)
    }
  }

  for (const exercise of exercises) {
    for (const id of exercise.avoidFor ?? []) {
      if (!conditionIds.has(id)) problems.push(`動作的 avoidFor 指向不存在的診斷：${exercise.id} → ${id}`)
    }
  }

  for (const region of peRegions) {
    const diagnosisIds = new Set(region.diagnoses.map((diagnosis) => diagnosis.id))
    if (region.tests.filter((test) => test.quick).length < 4) problems.push(`PE 快速模式少於 4 項：${region.id}`)
    if (region.tests.length < 6) problems.push(`PE 完整模式少於 6 項：${region.id}`)
    for (const diagnosis of region.diagnoses) {
      if (!region.tests.some((test) => test.targets.includes(diagnosis.id))) {
        problems.push(`PE 診斷沒有對應測試：${region.id} → ${diagnosis.id}`)
      }
    }
    for (const test of region.tests) {
      if (!peSources[test.sourceId]) problems.push(`PE 測試指向不存在的來源：${test.id} → ${test.sourceId}`)
      if (!test.method || !test.positive || !test.positiveMeans) problems.push(`PE 測試缺少操作或判讀：${test.id}`)
      if (!test.accuracy.sensitivity || !test.accuracy.specificity) problems.push(`PE 測試缺少 Sn／Sp 顯示：${test.id}`)
      for (const target of test.targets) {
        if (!diagnosisIds.has(target)) problems.push(`PE 測試指向其他部位或不存在的 DD：${test.id} → ${target}`)
      }
    }
  }

  const reachable = new Set<ConditionId>()
  for (const step of flowSteps) {
    const targets = [
      ...(step.options ?? []).map((option) => option.target),
      ...(step.clear ? [step.clear] : []),
    ]
    if (step.kind === 'redflag' && (!step.flags?.length || !step.clear)) {
      problems.push(`警訊步驟缺少 flags 或 clear：${step.id}`)
    }
    if (step.kind !== 'redflag' && !step.options?.length) {
      problems.push(`問答步驟沒有選項：${step.id}`)
    }
    for (const target of targets) {
      if (target.kind === 'step' && !stepIds.has(target.id)) {
        problems.push(`流程指向不存在的步驟：${step.id} → ${target.id}`)
      }
      if (target.kind === 'condition') {
        if (!conditionIds.has(target.id)) problems.push(`流程指向不存在的診斷：${step.id} → ${target.id}`)
        else reachable.add(target.id)
      }
    }
  }

  for (const region of regions) {
    if (!flowSteps.some((step) => step.region === region.id && step.kind === 'redflag')) {
      problems.push(`部位缺少警訊起點：${region.id}`)
    }
  }

  for (const condition of conditions) {
    if (!reachable.has(condition.id)) {
      problems.push(`診斷無法從症狀導引到達（只能手動選取）：${condition.id}（${getCondition(condition.id).name}）`)
    }
  }

  return problems
}
