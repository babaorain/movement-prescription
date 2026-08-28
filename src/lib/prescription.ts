import { conditions, exercises, getSubtype, subtypeCode, subtypes } from '../data'
import type { ConditionId, Dose, Prescription } from '../types'

const SOURCE_VERSION = '2026.08'

const frequencyCodes: Record<string, string> = {
  '每天 1 次': 'd1', '每天 2 次': 'd2', '每天 3 次': 'd3', '每週 3 次': 'w3', '每週 5 次': 'w5',
}

const reverse = (record: Record<string, string>) => Object.fromEntries(Object.entries(record).map(([key, value]) => [value, key]))
const frequencyNames = reverse(frequencyCodes)

// v2 的對照表直接由資料檔的 code 欄位產生，不需要另一份手維護的清單。
const conditionCodes = new Map(conditions.map((condition) => [condition.id, condition.code]))
const conditionIds = new Map(conditions.map((condition) => [condition.code, condition.id]))
const exerciseCodes = new Map(exercises.map((exercise) => [exercise.id, exercise.code]))
const exerciseIds = new Map(exercises.map((exercise) => [exercise.code, exercise.id]))
const subtypeIds = new Map(subtypes.map((subtype) => [subtypeCode(subtype.id)!, subtype.id]))

/**
 * 2026-08 之前發出的 QR 使用第一版短碼。這些對照表已凍結，不可再新增或修改，
 * 只用來讓舊連結仍能開啟。新處方一律走 v2。
 */
const legacyConditionIds: Record<string, ConditionId> = {
  n: 'neck-pain', s: 'shoulder', r: 'rotator-cuff', e: 'lateral-elbow', b: 'low-back',
  h: 'hip-oa', g: 'gtps', k: 'knee-oa', p: 'patellofemoral', a: 'ankle-sprain',
  f: 'plantar-heel', t: 'achilles',
}

const legacySubtypeIds: Record<string, string> = {
  n1: 'neck-sensitive', n2: 'neck-recovery',
  sh: 'shoulder-high', sm: 'shoulder-moderate', sl: 'shoulder-low',
  r1: 'rc-sensitive', r2: 'rc-loading',
  e1: 'elbow-sensitive', e2: 'elbow-loading',
  bg: 'back-general', be: 'back-extension', bf: 'back-flexion',
  h1: 'hip-oa-sensitive', h2: 'hip-oa-loading',
  g1: 'gtps-sensitive', g2: 'gtps-loading',
  k1: 'knee-oa-sensitive', k2: 'knee-oa-loading',
  p1: 'pfp-sensitive', p2: 'pfp-loading',
  a1: 'ankle-early', a2: 'ankle-balance',
  f1: 'plantar-sensitive', f2: 'plantar-loading',
  t1: 'achilles-sensitive', t2: 'achilles-loading',
}

const legacyExerciseIds: Record<string, string> = {
  ct: 'chin-tuck', nr: 'neck-rotation', sr: 'scapular-retraction',
  p: 'pendulum', ts: 'table-slide', ce: 'cane-er', ws: 'wall-slide', cb: 'cross-body', ti: 'towel-ir',
  si: 'shoulder-er-isometric',
  wi: 'wrist-extension-isometric', we: 'wrist-extension-eccentric', wt: 'wrist-extensor-stretch',
  pu: 'press-up', se: 'standing-extension', kc: 'knee-to-chest', ab: 'abdominal-brace', br: 'bridge', wa: 'walking',
  hs: 'heel-slide', ss: 'sit-to-stand', hai: 'hip-abduction-isometric', ha: 'standing-hip-abduction', qs: 'quad-set', su: 'step-up',
  ap: 'ankle-pumps', wg: 'weight-shift', lb: 'single-leg-balance',
  pf: 'plantar-fascia-stretch', cs: 'calf-stretch', crs: 'seated-calf-raise', cri: 'calf-raise-isometric', cr: 'calf-raise', crb: 'bent-knee-calf-raise',
}

export function cloneDose(dose: Dose): Dose {
  return { ...dose }
}

export function encodePrescription(prescription: Prescription): string {
  const selected = prescription.exercises.map((item) => item.dose.type === 'reps'
    ? `${exerciseCodes.get(item.id)}-r-${item.dose.reps}-${item.dose.sets}-${frequencyCodes[item.dose.frequency]}`
    : `${exerciseCodes.get(item.id)}-m-${item.dose.minutes}-${frequencyCodes[item.dose.frequency]}`)
  const date = prescription.createdAt.replace(/-/g, '').slice(2)
  return `2.${conditionCodes.get(prescription.condition)}.${subtypeCode(prescription.subtype)}.${selected.join('~')}.${date}`
}

function decodeItems(exerciseList: string, resolveId: (code: string) => string | undefined): Prescription['exercises'] | null {
  const encodedExercises = exerciseList.split('~')
  if (encodedExercises.length < 1 || encodedExercises.length > 3) return null
  const selected = encodedExercises.map((encoded) => {
    const item = encoded.split('-')
    const id = resolveId(item[0])
    const frequency = frequencyNames[item[item.length - 1]] as Dose['frequency'] | undefined
    if (!id || !frequency) return null
    if (item[1] === 'r' && item.length === 5) {
      const reps = Number(item[2])
      const sets = Number(item[3])
      if (!Number.isInteger(reps) || reps < 3 || reps > 20 || !Number.isInteger(sets) || sets < 1 || sets > 5) return null
      return { id, dose: { type: 'reps' as const, reps, sets, frequency } }
    }
    if (item[1] === 'm' && item.length === 4) {
      const minutes = Number(item[2])
      if (!Number.isInteger(minutes) || minutes < 3 || minutes > 30) return null
      return { id, dose: { type: 'duration' as const, minutes, frequency } }
    }
    return null
  })
  return selected.some((item) => item === null) ? null : selected as Prescription['exercises']
}

function decodeDate(code: string): string {
  return /^\d{6}$/.test(code) ? `20${code.slice(0, 2)}-${code.slice(2, 4)}-${code.slice(4, 6)}` : ''
}

function build(condition: ConditionId | undefined, subtypeId: string | undefined, date: string, exerciseList: string, resolveId: (code: string) => string | undefined): Prescription | null {
  const selected = decodeItems(exerciseList, resolveId)
  if (!condition || !subtypeId || !date || !selected) return null
  // 分型必須屬於該診斷，否則病人端會顯示互相矛盾的標題。
  if (getSubtype(subtypeId)?.condition !== condition) return null
  return { v: 2, condition, subtype: subtypeId, exercises: selected, createdAt: date, sourceVersion: SOURCE_VERSION }
}

export function decodePrescription(payload: string): Prescription | null {
  try {
    if (payload.startsWith('2.')) {
      const [version, conditionCode, subtypeCodeValue, exerciseList, dateCode, ...extra] = payload.split('.')
      if (version !== '2' || extra.length || !exerciseList) return null
      return build(
        conditionIds.get(conditionCode),
        subtypeIds.get(subtypeCodeValue),
        decodeDate(dateCode),
        exerciseList,
        (code) => exerciseIds.get(code),
      )
    }

    if (payload.startsWith('1.')) {
      const [version, conditionCode, subtypeCodeValue, exerciseList, dateCode, ...extra] = payload.split('.')
      if (version !== '1' || extra.length || !exerciseList) return null
      return build(
        legacyConditionIds[conditionCode],
        legacySubtypeIds[subtypeCodeValue],
        decodeDate(dateCode),
        exerciseList,
        (code) => legacyExerciseIds[code],
      )
    }

    // 更早期的 base64 連結格式。
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
      c?: string
      s?: string
      e?: (string | number)[][]
      d?: string
    }

    if (!parsed.c || !parsed.s || !parsed.e || !parsed.d) return null
    return build(
      legacyConditionIds[parsed.c],
      legacySubtypeIds[parsed.s],
      decodeDate(parsed.d),
      parsed.e.map((item) => item.join('-')).join('~'),
      (code) => legacyExerciseIds[code],
    )
  } catch {
    return null
  }
}

export function prescriptionUrl(prescription: Prescription): string {
  return `${window.location.origin}${window.location.pathname}#rx=${encodePrescription(prescription)}`
}

export function formatDose(dose: Dose): string {
  return dose.type === 'reps'
    ? `${dose.reps} 次 × ${dose.sets} 組・${dose.frequency}`
    : `${dose.minutes} 分鐘・${dose.frequency}`
}
