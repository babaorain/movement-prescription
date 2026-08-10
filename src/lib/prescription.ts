import type { Dose, Prescription } from '../types'

const subtypeCodes: Record<string, string> = {
  'shoulder-high': 'sh',
  'shoulder-moderate': 'sm',
  'shoulder-low': 'sl',
  'back-general': 'bg',
  'back-extension': 'be',
  'back-flexion': 'bf',
}

const exerciseCodes: Record<string, string> = {
  pendulum: 'p',
  'table-slide': 'ts',
  'cane-er': 'ce',
  'wall-slide': 'ws',
  'cross-body': 'cb',
  'towel-ir': 'ti',
  'press-up': 'pu',
  'standing-extension': 'se',
  'knee-to-chest': 'kc',
  'abdominal-brace': 'ab',
  bridge: 'br',
  walking: 'wa',
}

const frequencyCodes: Record<string, string> = {
  '每天 1 次': 'd1',
  '每天 2 次': 'd2',
  '每週 3 次': 'w3',
  '每週 5 次': 'w5',
}

const reverse = (record: Record<string, string>) => Object.fromEntries(Object.entries(record).map(([key, value]) => [value, key]))
const subtypeIds = reverse(subtypeCodes)
const exerciseIds = reverse(exerciseCodes)
const frequencies = reverse(frequencyCodes)

export function cloneDose(dose: Dose): Dose {
  return { ...dose }
}

export function encodePrescription(prescription: Prescription): string {
  const condition = prescription.condition === 'shoulder' ? 's' : 'b'
  const selected = prescription.exercises.map((item) => item.dose.type === 'reps'
    ? `${exerciseCodes[item.id]}-r-${item.dose.reps}-${item.dose.sets}-${frequencyCodes[item.dose.frequency]}`
    : `${exerciseCodes[item.id]}-m-${item.dose.minutes}-${frequencyCodes[item.dose.frequency]}`)
  const date = prescription.createdAt.replace(/-/g, '').slice(2)
  return `1.${condition}.${subtypeCodes[prescription.subtype]}.${selected.join('~')}.${date}`
}

export function decodePrescription(payload: string): Prescription | null {
  try {
    if (payload.startsWith('1.')) {
      const [version, conditionCode, subtypeCode, exerciseList, dateCode, ...extra] = payload.split('.')
      if (version !== '1' || extra.length || !exerciseList) return null
      const condition = conditionCode === 's' ? 'shoulder' : conditionCode === 'b' ? 'low-back' : null
      const subtype = subtypeIds[subtypeCode]
      const date = /^\d{6}$/.test(dateCode) ? `20${dateCode.slice(0, 2)}-${dateCode.slice(2, 4)}-${dateCode.slice(4, 6)}` : ''
      const encodedExercises = exerciseList.split('~')
      if (!condition || !subtype || !date || encodedExercises.length < 1 || encodedExercises.length > 3) return null

      const selected = encodedExercises.map((encoded) => {
        const item = encoded.split('-')
        const id = exerciseIds[item[0]]
        const frequency = frequencies[item[item.length - 1]] as Dose['frequency'] | undefined
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
      if (selected.some((item) => item === null)) return null
      return { v: 1, condition, subtype, exercises: selected as Prescription['exercises'], createdAt: date, sourceVersion: '2026.08' }
    }

    // Backward-compatible with the first compact, base64-encoded link format.
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Prescription & {
      c?: string
      s?: string
      e?: (string | number)[][]
      d?: string
    }

    if (parsed.c && parsed.s && parsed.e && parsed.d) {
      const condition = parsed.c === 's' ? 'shoulder' : parsed.c === 'b' ? 'low-back' : null
      const subtype = subtypeIds[parsed.s]
      const date = /^\d{6}$/.test(parsed.d) ? `20${parsed.d.slice(0, 2)}-${parsed.d.slice(2, 4)}-${parsed.d.slice(4, 6)}` : ''
      if (!condition || !subtype || !date || parsed.e.length < 1 || parsed.e.length > 3) return null

      const selected = parsed.e.map((item) => {
        const id = exerciseIds[String(item[0])]
        const frequency = frequencies[String(item[item.length - 1])] as Dose['frequency'] | undefined
        if (!id || !frequency) return null
        if (item[1] === 'r') {
          const reps = Number(item[2])
          const sets = Number(item[3])
          if (!Number.isInteger(reps) || reps < 3 || reps > 20 || !Number.isInteger(sets) || sets < 1 || sets > 5) return null
          return { id, dose: { type: 'reps' as const, reps, sets, frequency } }
        }
        if (item[1] === 'm') {
          const minutes = Number(item[2])
          if (!Number.isInteger(minutes) || minutes < 3 || minutes > 30) return null
          return { id, dose: { type: 'duration' as const, minutes, frequency } }
        }
        return null
      })
      if (selected.some((item) => item === null)) return null
      return { v: 1, condition, subtype, exercises: selected as Prescription['exercises'], createdAt: date, sourceVersion: '2026.08' }
    }

    // Backward-compatible with the earlier, verbose link format.
    if (parsed.v !== 1 || !Array.isArray(parsed.exercises) || parsed.exercises.length < 1 || parsed.exercises.length > 3) return null
    if (!['shoulder', 'low-back'].includes(parsed.condition)) return null
    return parsed
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
