import type { ConditionId, Exercise, Subtype } from './types'

export const conditions: { id: ConditionId; name: string; hint: string }[] = [
  { id: 'shoulder', name: '五十肩', hint: '肩關節活動受限' },
  { id: 'low-back', name: '下背痛', hint: '非特異性下背症狀' },
]

export const subtypes: Subtype[] = [
  {
    id: 'shoulder-high',
    condition: 'shoulder',
    name: '高敏感期',
    description: '夜間痛或休息痛明顯，以舒適範圍、低負荷活動為主。',
    presetIds: ['pendulum', 'table-slide', 'cane-er'],
  },
  {
    id: 'shoulder-moderate',
    condition: 'shoulder',
    name: '中敏感期',
    description: '疼痛逐漸穩定，可溫和增加活動範圍。',
    presetIds: ['table-slide', 'cane-er', 'wall-slide'],
  },
  {
    id: 'shoulder-low',
    condition: 'shoulder',
    name: '低敏感期',
    description: '疼痛較少、僵硬為主，可漸進拉伸。',
    presetIds: ['wall-slide', 'cross-body', 'towel-ir'],
  },
  {
    id: 'back-general',
    condition: 'low-back',
    name: '未分類／一般活動',
    description: '先恢復日常活動與基本軀幹控制，不強求特定方向。',
    presetIds: ['abdominal-brace', 'bridge', 'walking'],
  },
  {
    id: 'back-extension',
    condition: 'low-back',
    name: '伸展方向偏好',
    description: '重複伸展後，症狀減輕或往腰部集中。',
    presetIds: ['press-up', 'standing-extension', 'walking'],
    needsDirectionalConfirmation: true,
  },
  {
    id: 'back-flexion',
    condition: 'low-back',
    name: '屈曲方向偏好',
    description: '重複屈曲後，症狀減輕或往腰部集中。',
    presetIds: ['knee-to-chest', 'abdominal-brace', 'walking'],
    needsDirectionalConfirmation: true,
  },
]

export const exercises: Exercise[] = [
  {
    id: 'pendulum', condition: 'shoulder', name: '鐘擺運動', shortName: '鐘擺', image: '/exercises/pendulum.png',
    summary: '讓手臂放鬆，用身體帶動小幅度擺動。',
    steps: ['健側手扶桌，身體微微前傾。', '患側手臂完全放鬆，自然垂下。', '用身體帶動前後、左右或小圈擺動。'],
    keyCue: '肩膀不要出力；幅度小、動作順。',
    dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'table-slide', condition: 'shoulder', name: '桌面前滑', shortName: '桌面前滑', image: '/exercises/table-slide.png',
    summary: '利用桌面支撐，溫和帶動肩膀向前。',
    steps: ['面對桌子坐好，雙手放在毛巾上。', '身體向前，讓手沿桌面慢慢滑遠。', '到輕微緊繃處停一下，再慢慢回來。'],
    keyCue: '不要聳肩，不要硬壓到明顯疼痛。',
    dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'cane-er', condition: 'shoulder', name: '棍棒輔助外轉', shortName: '輔助外轉', image: '/exercises/cane-er.png',
    summary: '手肘貼身，以健側手溫和帶動外轉。',
    steps: ['仰躺或坐好，雙手握住棍棒，手肘彎曲。', '患側手肘貼近身體，可夾一條小毛巾。', '健側手緩慢推動棍棒，帶患側手向外。'],
    keyCue: '只到輕微緊繃，不追求角度。',
    dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'wall-slide', condition: 'shoulder', name: '牆面上滑', shortName: '牆面上滑', image: '/exercises/wall-slide.png',
    summary: '手沿牆面向上滑，逐步增加抬手範圍。',
    steps: ['面對牆站立，手掌或毛巾貼牆。', '手慢慢向上滑，身體保持直立。', '到可接受的緊繃處停一下，再控制回來。'],
    keyCue: '肋骨不要翻起；疼痛維持可接受。',
    dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'cross-body', condition: 'shoulder', name: '橫向抱肩伸展', shortName: '抱肩伸展', image: '/exercises/cross-body.png',
    summary: '將手臂橫拉過胸，伸展肩膀後側。',
    steps: ['坐好或站好，患側手臂抬到胸前。', '健側手托住手肘，輕輕往對側帶。', '感到肩後側拉伸，停留後放鬆。'],
    keyCue: '身體不要轉；避免夾擠或尖銳痛。',
    dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'towel-ir', condition: 'shoulder', name: '毛巾背後伸展', shortName: '背後伸展', image: '/exercises/towel-ir.png',
    summary: '用毛巾輔助患側手在背後向上移動。',
    steps: ['雙手在背後抓住毛巾，上方為健側手。', '健側手慢慢往上拉，帶動患側手上移。', '到輕微緊繃處停留，再慢慢放鬆。'],
    keyCue: '保持胸口直立；不要猛拉。',
    dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'press-up', condition: 'low-back', name: '俯臥撐起', shortName: '俯臥撐起', image: '/exercises/press-up.png',
    summary: '骨盆放鬆貼床，以手臂撐起上半身。',
    steps: ['趴著，雙手放在肩膀兩側。', '臀部與腿放鬆，用手臂慢慢撐起上身。', '到舒適範圍後回到起始位置。'],
    keyCue: '若腿部症狀往更遠處延伸，立即停止。',
    dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'standing-extension', condition: 'low-back', name: '站姿後伸', shortName: '站姿後伸', image: '/exercises/standing-extension.png',
    summary: '站穩後，雙手支撐腰部，溫和向後伸展。',
    steps: ['雙腳與肩同寬站穩，雙手扶住腰後。', '保持膝蓋伸直，身體緩慢向後。', '到舒適範圍後回正，稍停再重複。'],
    keyCue: '動作慢；若腿痛往下延伸就停止。',
    dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'knee-to-chest', condition: 'low-back', name: '單膝抱胸', shortName: '單膝抱胸', image: '/exercises/knee-to-chest.png',
    summary: '仰躺將單膝溫和靠近胸口。',
    steps: ['仰躺，雙膝彎曲、腳掌踩穩。', '雙手抱住一側大腿或膝下，往胸口帶。', '停留一下，放回後換邊。'],
    keyCue: '肩頸放鬆；不要用力拉扯膝蓋。',
    dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'abdominal-brace', condition: 'low-back', name: '腹部穩定收縮', shortName: '腹部穩定', image: '/exercises/abdominal-brace.png',
    summary: '維持呼吸，輕收下腹，建立軀幹控制。',
    steps: ['仰躺屈膝，雙腳踩穩，腰背自然。', '像準備咳嗽一樣，輕輕收緊下腹。', '正常呼吸數秒，再完全放鬆。'],
    keyCue: '不要憋氣，也不要把腰用力壓平。',
    dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'bridge', condition: 'low-back', name: '橋式', shortName: '橋式', image: '/exercises/bridge.png',
    summary: '收緊臀部，將骨盆平穩抬離床面。',
    steps: ['仰躺屈膝，雙腳與髖同寬。', '輕收腹與臀部，將骨盆慢慢抬起。', '身體成斜線後停一下，再控制放下。'],
    keyCue: '力量來自臀部；腰不要過度拱起。',
    dose: { type: 'reps', reps: 8, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'walking', condition: 'low-back', name: '舒適步行', shortName: '步行', image: '/exercises/walking.png',
    summary: '以可對話的速度步行，逐步恢復日常活動。',
    steps: ['穿合腳的鞋，選擇平坦、安全的路線。', '用自然步幅，以能正常說話的速度前進。', '可分段完成；隔天沒有明顯惡化再漸增。'],
    keyCue: '不必忍痛完成；時間可拆成數段。',
    dose: { type: 'duration', minutes: 10, frequency: '每週 5 次' },
  },
]

export const getExercise = (id: string) => exercises.find((exercise) => exercise.id === id)
export const getSubtype = (id: string) => subtypes.find((subtype) => subtype.id === id)

export const conditionName = (id: ConditionId) => conditions.find((condition) => condition.id === id)?.name ?? ''
