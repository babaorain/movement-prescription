export type ConditionId = 'shoulder' | 'low-back'

export type Frequency = '每天 1 次' | '每天 2 次' | '每週 3 次' | '每週 5 次'

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

export type Exercise = {
  id: string
  condition: ConditionId
  name: string
  shortName: string
  image: string
  summary: string
  steps: [string, string, string]
  keyCue: string
  dose: Dose
}

export type Subtype = {
  id: string
  condition: ConditionId
  name: string
  description: string
  presetIds: [string, string, string]
  needsDirectionalConfirmation?: boolean
}

export type SelectedExercise = {
  id: string
  dose: Dose
}

export type Prescription = {
  v: 1
  condition: ConditionId
  subtype: string
  exercises: SelectedExercise[]
  createdAt: string
  sourceVersion: '2026.08'
}
