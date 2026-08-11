import type { Condition, ConditionId, Exercise, RegionId, Subtype } from './types'

export const regions: { id: RegionId | 'all'; name: string }[] = [
  { id: 'all', name: '全部' },
  { id: 'neck-shoulder', name: '頸肩' },
  { id: 'upper-limb', name: '上肢' },
  { id: 'trunk', name: '軀幹' },
  { id: 'hip-knee', name: '髖膝' },
  { id: 'foot-ankle', name: '足踝' },
]

export const conditions: Condition[] = [
  {
    id: 'neck-pain', name: '頸部疼痛', hint: '活動受限／姿勢相關', region: 'neck-shoulder',
    keywords: ['脖子', '頸椎', '落枕', '肩頸'], stageHint: '依症狀敏感度與控制能力選擇',
    safetyHint: '新出現走路不穩、手部笨拙、雙側麻木，或突發劇烈頭痛／暈眩；',
  },
  {
    id: 'shoulder', name: '五十肩', hint: '肩關節活動受限', region: 'neck-shoulder',
    keywords: ['冰凍肩', '沾黏性肩關節囊炎', '肩膀僵硬'], stageHint: '依疼痛敏感度調整活動範圍與負荷',
    safetyHint: '肩／上背不適伴胸口悶、喘或冒冷汗；',
  },
  {
    id: 'rotator-cuff', name: '旋轉肌相關肩痛', hint: '抬手痛／肩袖症狀', region: 'neck-shoulder',
    keywords: ['旋轉肌', '肩袖', '夾擠', '抬手痛'], stageHint: '先找可接受的負荷，再漸進強化',
    safetyHint: '明顯外傷後突然無法抬手，或肩／上背不適伴胸口悶、喘、冒冷汗；',
  },
  {
    id: 'lateral-elbow', name: '外側肘痛', hint: '網球肘／伸腕肌腱', region: 'upper-limb',
    keywords: ['網球肘', '手肘外側', '伸腕肌腱'], stageHint: '依握力與負重反應選擇等長或漸進阻力',
    safetyHint: '明顯外傷、關節變形或持續紅腫熱，或新出現手部無力／麻木；',
  },
  {
    id: 'low-back', name: '下背痛', hint: '非特異性下背症狀', region: 'trunk',
    keywords: ['腰痛', '腰痠', '坐骨神經', '背痛'], stageHint: '依重複動作反應選擇；不確定就用一般活動',
    safetyHint: '新發大小便異常、會陰或大腿內側麻木；',
  },
  {
    id: 'hip-oa', name: '髖關節退化', hint: '髖部疼痛／活動受限', region: 'hip-knee',
    keywords: ['髖關節炎', '髖退化', '鼠蹊痛'], stageHint: '依疼痛敏感度安排活動度、肌力與步行',
    safetyHint: '跌倒或外傷後無法承重，或髖部劇痛伴發燒／全身不適；',
  },
  {
    id: 'gtps', name: '外側髖痛', hint: '大轉子疼痛症候群', region: 'hip-knee',
    keywords: ['臀肌肌腱', '大轉子', '側睡痛'], stageHint: '降低壓迫姿勢，依耐受度訓練臀肌',
    safetyHint: '跌倒或外傷後無法承重，或髖部劇痛伴發燒／全身不適；',
  },
  {
    id: 'knee-oa', name: '膝關節退化', hint: '膝骨關節炎', region: 'hip-knee',
    keywords: ['膝退化', '膝關節炎', '膝蓋無力'], stageHint: '依承重耐受度安排活動度與功能肌力',
    safetyHint: '重大外傷後無法承重、膝關節明顯變形，或紅腫熱伴發燒；',
  },
  {
    id: 'patellofemoral', name: '髕股疼痛', hint: '前膝痛／上下樓痛', region: 'hip-knee',
    keywords: ['前膝痛', '髕骨', '跑者膝', '樓梯痛'], stageHint: '以髖外側與膝伸肌共同訓練為主',
    safetyHint: '明顯外傷、膝蓋鎖住、快速腫脹，或反覆無預警軟腳；',
  },
  {
    id: 'ankle-sprain', name: '踝扭傷恢復', hint: '活動度／平衡恢復', region: 'foot-ankle',
    keywords: ['翻船', '腳踝扭傷', '踝不穩'], stageHint: '依承重能力選擇早期活動或平衡訓練',
    safetyHint: '外傷後無法走四步、骨頭壓痛明顯、關節變形或快速加劇的腫脹；',
  },
  {
    id: 'plantar-heel', name: '足底跟痛', hint: '足底筋膜相關疼痛', region: 'foot-ankle',
    keywords: ['足底筋膜炎', '腳跟痛', '下床第一步'], stageHint: '先改善足底與小腿柔軟度，再漸進負重',
    safetyHint: '外傷後無法承重、足部紅腫熱，或疼痛合併傷口／發燒；',
  },
  {
    id: 'achilles', name: '跟腱中段疼痛', hint: '非附著點型', region: 'foot-ankle',
    keywords: ['阿基里斯腱', '跟腱炎', '腳跟後側'], stageHint: '在可接受症狀內，循序增加跟腱負荷',
    safetyHint: '突然啪一聲、無法踮腳或明顯凹陷，須先排除跟腱斷裂；',
  },
]

export const subtypes: Subtype[] = [
  { id: 'neck-sensitive', condition: 'neck-pain', name: '較敏感／活動受限', description: '以舒適活動度與低負荷頸肩控制開始。', presetIds: ['chin-tuck', 'neck-rotation', 'scapular-retraction'] },
  { id: 'neck-recovery', condition: 'neck-pain', name: '恢復控制／耐力', description: '症狀較穩定，可增加頸部控制與肩胛帶耐力。', presetIds: ['chin-tuck', 'scapular-retraction', 'wall-slide'] },
  { id: 'shoulder-high', condition: 'shoulder', name: '高敏感期', description: '夜間痛或休息痛明顯，以舒適範圍、低負荷活動為主。', presetIds: ['pendulum', 'table-slide', 'cane-er'] },
  { id: 'shoulder-moderate', condition: 'shoulder', name: '中敏感期', description: '疼痛逐漸穩定，可溫和增加活動範圍。', presetIds: ['table-slide', 'cane-er', 'wall-slide'] },
  { id: 'shoulder-low', condition: 'shoulder', name: '低敏感期', description: '疼痛較少、僵硬為主，可漸進拉伸。', presetIds: ['wall-slide', 'cross-body', 'towel-ir'] },
  { id: 'rc-sensitive', condition: 'rotator-cuff', name: '疼痛較敏感', description: '從等長收縮與可接受角度的主動活動開始。', presetIds: ['shoulder-er-isometric', 'scapular-retraction', 'wall-slide'] },
  { id: 'rc-loading', condition: 'rotator-cuff', name: '可漸進負荷', description: '以主動動作、動作控制與阻力訓練逐步增加負荷。', presetIds: ['shoulder-er-isometric', 'wall-slide', 'scapular-retraction'] },
  { id: 'elbow-sensitive', condition: 'lateral-elbow', name: '負重較敏感', description: '先以等長收縮與溫和伸展，避免一次增加太多抓握量。', presetIds: ['wrist-extension-isometric', 'wrist-extensor-stretch', 'wrist-extension-eccentric'] },
  { id: 'elbow-loading', condition: 'lateral-elbow', name: '可漸進負荷', description: '逐步增加伸腕肌群的離心／向心阻力與耐力。', presetIds: ['wrist-extension-eccentric', 'wrist-extension-isometric', 'wrist-extensor-stretch'] },
  { id: 'back-general', condition: 'low-back', name: '未分類／一般活動', description: '先恢復日常活動與基本軀幹控制，不強求特定方向。', presetIds: ['abdominal-brace', 'bridge', 'walking'] },
  { id: 'back-extension', condition: 'low-back', name: '伸展方向偏好', description: '重複伸展後，症狀減輕或往腰部集中。', presetIds: ['press-up', 'standing-extension', 'walking'], needsDirectionalConfirmation: true },
  { id: 'back-flexion', condition: 'low-back', name: '屈曲方向偏好', description: '重複屈曲後，症狀減輕或往腰部集中。', presetIds: ['knee-to-chest', 'abdominal-brace', 'walking'], needsDirectionalConfirmation: true },
  { id: 'hip-oa-sensitive', condition: 'hip-oa', name: '疼痛較敏感', description: '先維持髖部活動，搭配低負荷功能訓練。', presetIds: ['heel-slide', 'bridge', 'walking'] },
  { id: 'hip-oa-loading', condition: 'hip-oa', name: '可漸進負荷', description: '逐步增加下肢肌力、功能活動與有氧耐力。', presetIds: ['sit-to-stand', 'bridge', 'walking'] },
  { id: 'gtps-sensitive', condition: 'gtps', name: '壓迫／負重較敏感', description: '避免夾腿與直接側睡壓迫，先從雙腳支撐的臀肌等長與低負荷訓練開始。', presetIds: ['hip-abduction-isometric', 'bridge', 'sit-to-stand'] },
  { id: 'gtps-loading', condition: 'gtps', name: '可漸進負荷', description: '循序增加臀肌阻力與單腳承重能力。', presetIds: ['standing-hip-abduction', 'sit-to-stand', 'step-up'] },
  { id: 'knee-oa-sensitive', condition: 'knee-oa', name: '疼痛較敏感', description: '先維持膝部活動度與股四頭肌控制。', presetIds: ['heel-slide', 'quad-set', 'sit-to-stand'] },
  { id: 'knee-oa-loading', condition: 'knee-oa', name: '可漸進負荷', description: '逐步增加坐站、階梯與步行等功能負荷。', presetIds: ['sit-to-stand', 'step-up', 'walking'] },
  { id: 'pfp-sensitive', condition: 'patellofemoral', name: '負重較敏感', description: '先從髖外側與低負荷膝伸肌訓練開始。', presetIds: ['standing-hip-abduction', 'quad-set', 'bridge'] },
  { id: 'pfp-loading', condition: 'patellofemoral', name: '可漸進負荷', description: '共同訓練髖外側與膝伸肌，漸進回到樓梯與蹲站。', presetIds: ['standing-hip-abduction', 'sit-to-stand', 'step-up'] },
  { id: 'ankle-early', condition: 'ankle-sprain', name: '早期／承重恢復', description: '依耐受度恢復活動度與漸進承重；必要時配合外部支持。', presetIds: ['ankle-pumps', 'weight-shift', 'calf-stretch'] },
  { id: 'ankle-balance', condition: 'ankle-sprain', name: '平衡／再受傷預防', description: '加入本體感覺、平衡與小腿肌力訓練。', presetIds: ['single-leg-balance', 'calf-raise', 'ankle-pumps'] },
  { id: 'plantar-sensitive', condition: 'plantar-heel', name: '起步痛較敏感', description: '以足底筋膜特定伸展與小腿伸展開始。', presetIds: ['plantar-fascia-stretch', 'calf-stretch', 'seated-calf-raise'] },
  { id: 'plantar-loading', condition: 'plantar-heel', name: '可漸進負荷', description: '保留足底伸展，逐步增加坐姿與站姿提踵負荷。', presetIds: ['plantar-fascia-stretch', 'calf-raise', 'seated-calf-raise'] },
  { id: 'achilles-sensitive', condition: 'achilles', name: '負荷較敏感', description: '完全休息通常非首選；從可接受的坐姿、等長與雙腳負荷開始。', presetIds: ['seated-calf-raise', 'calf-raise-isometric', 'calf-raise'] },
  { id: 'achilles-loading', condition: 'achilles', name: '可漸進負荷', description: '依耐受度提高跟腱負荷，逐步從雙腳進展到單腳。', presetIds: ['calf-raise', 'bent-knee-calf-raise', 'step-up'] },
]

export const exercises: Exercise[] = [
  {
    id: 'chin-tuck', conditions: ['neck-pain'], name: '下巴微收', shortName: '下巴微收', image: '/exercises/neck-control.png',
    summary: '輕收下巴，讓頭部回到軀幹正上方。',
    steps: ['坐直或靠牆，眼睛保持水平。', '下巴輕輕往後收，像做出小小雙下巴。', '維持自然呼吸後放鬆，不必低頭。'],
    keyCue: '力量要輕；若出現暈眩、手麻加劇就停止。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'neck-rotation', conditions: ['neck-pain'], name: '頸部舒適轉動', shortName: '頸部轉動', image: '/exercises/neck-control.png',
    summary: '在舒適範圍內左右轉頭，維持頸部活動。',
    steps: ['坐直，肩膀放鬆，眼睛平視前方。', '緩慢轉頭看向一側，到輕微緊繃處。', '回到中間，再換另一側。'],
    keyCue: '不要甩動或硬壓角度；不追求喀喀聲。', dose: { type: 'reps', reps: 6, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'scapular-retraction', conditions: ['neck-pain', 'rotator-cuff'], name: '肩胛骨後收', shortName: '肩胛後收', image: '/exercises/neck-control.png',
    summary: '放鬆肩膀，溫和將兩側肩胛骨向後靠近。',
    steps: ['坐直或站直，雙手自然垂下。', '肩膀保持下沉，肩胛骨輕輕向後靠近。', '維持數秒後完全放鬆。'],
    keyCue: '不要聳肩，也不要用力挺胸或憋氣。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'pendulum', conditions: ['shoulder'], name: '鐘擺運動', shortName: '鐘擺', image: '/exercises/pendulum.png',
    summary: '讓手臂放鬆，用身體帶動小幅度擺動。', steps: ['健側手扶桌，身體微微前傾。', '患側手臂完全放鬆，自然垂下。', '用身體帶動前後、左右或小圈擺動。'], keyCue: '肩膀不要出力；幅度小、動作順。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'table-slide', conditions: ['shoulder'], name: '桌面前滑', shortName: '桌面前滑', image: '/exercises/table-slide.png',
    summary: '利用桌面支撐，溫和帶動肩膀向前。', steps: ['面對桌子坐好，雙手放在毛巾上。', '身體向前，讓手沿桌面慢慢滑遠。', '到輕微緊繃處停一下，再慢慢回來。'], keyCue: '不要聳肩，不要硬壓到明顯疼痛。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'cane-er', conditions: ['shoulder'], name: '棍棒輔助外轉', shortName: '輔助外轉', image: '/exercises/cane-er.png',
    summary: '手肘貼身，以健側手溫和帶動外轉。', steps: ['仰躺或坐好，雙手握住棍棒，手肘彎曲。', '患側手肘貼近身體，可夾一條小毛巾。', '健側手緩慢推動棍棒，帶患側手向外。'], keyCue: '只到輕微緊繃，不追求角度。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'wall-slide', conditions: ['neck-pain', 'shoulder', 'rotator-cuff'], name: '牆面上滑', shortName: '牆面上滑', image: '/exercises/wall-slide.png',
    summary: '手沿牆面向上滑，逐步增加抬手範圍。', steps: ['面對牆站立，手掌或毛巾貼牆。', '手慢慢向上滑，身體保持直立。', '到可接受的緊繃處停一下，再控制回來。'], keyCue: '肋骨不要翻起；疼痛維持可接受。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'cross-body', conditions: ['shoulder'], name: '橫向抱肩伸展', shortName: '抱肩伸展', image: '/exercises/cross-body.png',
    summary: '將手臂橫拉過胸，伸展肩膀後側。', steps: ['坐好或站好，患側手臂抬到胸前。', '健側手托住手肘，輕輕往對側帶。', '感到肩後側拉伸，停留後放鬆。'], keyCue: '身體不要轉；避免夾擠或尖銳痛。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'towel-ir', conditions: ['shoulder'], name: '毛巾背後伸展', shortName: '背後伸展', image: '/exercises/towel-ir.png',
    summary: '用毛巾輔助患側手在背後向上移動。', steps: ['雙手在背後抓住毛巾，上方為健側手。', '健側手慢慢往上拉，帶動患側手上移。', '到輕微緊繃處停留，再慢慢放鬆。'], keyCue: '保持胸口直立；不要猛拉。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'shoulder-er-isometric', conditions: ['rotator-cuff'], name: '肩外轉等長收縮', shortName: '肩外轉等長', image: '/exercises/shoulder-isometric.png',
    summary: '手肘貼身，向外出力但不讓手臂移動。', steps: ['側身站在牆邊，手肘彎曲並貼近身體。', '手背輕推牆面，維持肩膀與手肘不動。', '保持呼吸數秒，再完全放鬆。'], keyCue: '只用中等以下力量；不要聳肩或憋氣。', dose: { type: 'reps', reps: 6, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'wrist-extension-isometric', conditions: ['lateral-elbow'], name: '伸腕等長收縮', shortName: '伸腕等長', image: '/exercises/wrist-loading.png',
    summary: '手腕想往上抬，以另一手抵住不讓它移動。', steps: ['前臂放桌上，手掌朝下、手腕靠近桌緣。', '患側手腕想往上抬，另一手提供阻力。', '手腕保持不動，維持數秒後放鬆。'], keyCue: '出力以可接受為準，不要握拳過緊。', dose: { type: 'reps', reps: 6, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'wrist-extension-eccentric', conditions: ['lateral-elbow'], name: '伸腕離心訓練', shortName: '伸腕離心', image: '/exercises/wrist-loading.png',
    summary: '用健手協助抬起，患側手腕慢慢控制放下。', steps: ['前臂放桌上，手掌朝下，手握輕物。', '健側手協助把患側手腕抬高。', '放開健側手，由患側手腕慢慢下降。'], keyCue: '下降至少 3 秒；負重從很輕開始。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'wrist-extensor-stretch', conditions: ['lateral-elbow'], name: '伸腕肌群伸展', shortName: '前臂伸展', image: '/exercises/wrist-loading.png',
    summary: '手肘伸直，將手腕與手指溫和向下帶。', steps: ['手臂向前伸直，手掌朝下。', '另一手握住手背，輕輕將手腕向下彎。', '感到前臂外側拉伸後停留，再放鬆。'], keyCue: '只有拉伸感，不要拉到肘外側明顯痛。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'press-up', conditions: ['low-back'], name: '俯臥撐起', shortName: '俯臥撐起', image: '/exercises/press-up.png',
    summary: '骨盆放鬆貼床，以手臂撐起上半身。', steps: ['趴著，雙手放在肩膀兩側。', '臀部與腿放鬆，用手臂慢慢撐起上身。', '到舒適範圍後回到起始位置。'], keyCue: '若腿部症狀往更遠處延伸，立即停止。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'standing-extension', conditions: ['low-back'], name: '站姿後伸', shortName: '站姿後伸', image: '/exercises/standing-extension.png',
    summary: '站穩後，雙手支撐腰部，溫和向後伸展。', steps: ['雙腳與肩同寬站穩，雙手扶住腰後。', '保持膝蓋伸直，身體緩慢向後。', '到舒適範圍後回正，稍停再重複。'], keyCue: '動作慢；若腿痛往下延伸就停止。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'knee-to-chest', conditions: ['low-back'], name: '單膝抱胸', shortName: '單膝抱胸', image: '/exercises/knee-to-chest.png',
    summary: '仰躺將單膝溫和靠近胸口。', steps: ['仰躺，雙膝彎曲、腳掌踩穩。', '雙手抱住一側大腿或膝下，往胸口帶。', '停留一下，放回後換邊。'], keyCue: '肩頸放鬆；不要用力拉扯膝蓋。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'abdominal-brace', conditions: ['low-back'], name: '腹部穩定收縮', shortName: '腹部穩定', image: '/exercises/abdominal-brace.png',
    summary: '維持呼吸，輕收下腹，建立軀幹控制。', steps: ['仰躺屈膝，雙腳踩穩，腰背自然。', '像準備咳嗽一樣，輕輕收緊下腹。', '正常呼吸數秒，再完全放鬆。'], keyCue: '不要憋氣，也不要把腰用力壓平。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'bridge', conditions: ['low-back', 'hip-oa', 'gtps', 'patellofemoral'], name: '橋式', shortName: '橋式', image: '/exercises/bridge.png',
    summary: '收緊臀部，將骨盆平穩抬離床面。', steps: ['仰躺屈膝，雙腳與髖同寬。', '輕收腹與臀部，將骨盆慢慢抬起。', '身體成斜線後停一下，再控制放下。'], keyCue: '力量來自臀部；腰不要過度拱起。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'walking', conditions: ['low-back', 'hip-oa', 'knee-oa'], name: '舒適步行', shortName: '步行', image: '/exercises/walking.png',
    summary: '以可對話的速度步行，逐步恢復日常活動。', steps: ['穿合腳的鞋，選擇平坦安全的路線；炎熱潮濕時改在室內。', '用自然步幅，以能正常說話的速度前進。', '可分段完成；隔天沒有明顯惡化再漸增。'], keyCue: '天氣太熱就改在室內。若頭暈、噁心或身體異常發熱，立即停止、到陰涼處並找人幫忙。', dose: { type: 'duration', minutes: 10, frequency: '每週 5 次' },
  },
  {
    id: 'heel-slide', conditions: ['hip-oa', 'knee-oa'], name: '仰躺腳跟滑動', shortName: '腳跟滑動', image: '/exercises/heel-slide.png',
    summary: '腳跟沿床面滑動，溫和活動髖膝。', steps: ['仰躺，雙腿伸直或舒適放鬆。', '一側腳跟沿床面慢慢滑向臀部。', '到舒適彎曲角度後，再慢慢滑回。'], keyCue: '腳跟不要抬離床面；不需要硬壓角度。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'sit-to-stand', conditions: ['hip-oa', 'gtps', 'knee-oa', 'patellofemoral'], name: '坐到站', shortName: '坐到站', image: '/exercises/sit-to-stand.png',
    summary: '從穩固椅子平穩站起，再控制坐下。', steps: ['坐在穩固椅子前半部，雙腳踩穩。', '身體微微前傾，雙腳出力站起。', '站穩後，臀部往後並慢慢坐下。'], keyCue: '膝蓋朝腳尖方向；需要時可用扶手協助。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'hip-abduction-isometric', conditions: ['gtps'], name: '仰躺髖外展等長', shortName: '髖外展等長', image: '/exercises/hip-abduction-isometric.png',
    summary: '仰躺屈膝，以帶子限制動作，溫和啟動髖外側肌群。', steps: ['仰躺屈膝、雙腳踩穩，在雙膝外套一條不易滑動的帶子。', '雙膝同時輕輕往外推，帶子限制膝蓋不要明顯移動。', '維持約 10 秒並正常呼吸，再完全放鬆。'], keyCue: '雙腳保持踩地；只用可接受的力量，不要夾腿或憋氣。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'standing-hip-abduction', conditions: ['gtps', 'patellofemoral'], name: '站姿髖外展', shortName: '髖外展', image: '/exercises/hip-abduction.png',
    summary: '扶穩後將腿向外移，訓練髖外側肌群。', steps: ['站在穩固桌邊，單手輕扶。', '身體保持直立，一側腿慢慢向外移。', '腳尖朝前，停一下後控制回來。'], keyCue: '骨盆不要側傾；幅度小也可以。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'quad-set', conditions: ['knee-oa', 'patellofemoral'], name: '股四頭肌等長收縮', shortName: '大腿前側收縮', image: '/exercises/quad-set.png',
    summary: '膝蓋伸直，收緊大腿前側肌肉。', steps: ['坐或躺好，患側腿伸直並放鬆。', '腳尖朝上，收緊大腿前側，讓膝後靠近床面。', '維持數秒後完全放鬆。'], keyCue: '膝蓋本身不要用力往下壓到疼痛。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'step-up', conditions: ['gtps', 'knee-oa', 'patellofemoral', 'achilles'], name: '低階踏步', shortName: '低階踏步', image: '/exercises/step-up.png',
    summary: '踏上低台階，訓練髖膝與小腿的功能力量。', steps: ['面對低而穩固的台階，旁邊有扶手。', '一腳踩上台階，身體向上站穩。', '控制速度慢慢退回地面，再重複。'], keyCue: '膝蓋對準腳尖；先從很低的高度開始。', dose: { type: 'reps', reps: 6, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'ankle-pumps', conditions: ['ankle-sprain'], name: '踝關節上下活動', shortName: '腳踝上下動', image: '/exercises/ankle-mobility.png',
    summary: '在舒適範圍內勾腳與踩腳，恢復踝部活動。', steps: ['坐好或躺好，腳踝放鬆。', '腳尖慢慢往自己方向勾起。', '再慢慢往下踩，到舒適範圍即可。'], keyCue: '不要快速畫大圈；腫痛明顯增加就減量。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'weight-shift', conditions: ['ankle-sprain'], name: '扶穩重心轉移', shortName: '重心轉移', image: '/exercises/ankle-mobility.png',
    summary: '扶著桌面，將重量逐步移到患側腳。', steps: ['雙腳站立，雙手扶穩桌面。', '身體保持直立，重心慢慢移向患側。', '維持舒適承重後，再移回中間。'], keyCue: '先確保安全；可承重多少就做多少。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'single-leg-balance', conditions: ['ankle-sprain'], name: '扶穩單腳平衡', shortName: '單腳平衡', image: '/exercises/single-leg-balance.png',
    summary: '在可隨時扶住的環境練習單腳站立。', steps: ['站在穩固桌邊，手指輕扶桌面。', '將另一腳抬離地面，患側腳保持站穩。', '維持後放下；熟練再減少手部支撐。'], keyCue: '旁邊不要有雜物；不閉眼、不站軟墊。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'plantar-fascia-stretch', conditions: ['plantar-heel'], name: '足底筋膜特定伸展', shortName: '足底伸展', image: '/exercises/plantar-stretch.png',
    summary: '坐姿將大腳趾往上拉，伸展足底筋膜。', steps: ['坐好，將患側腳踝放到另一側大腿上。', '一手抓住腳趾，將腳趾往小腿方向拉。', '感到足弓繃緊後停留，再放鬆。'], keyCue: '可在下床第一步前先做；不要拉到尖銳痛。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 2 次' },
  },
  {
    id: 'calf-stretch', conditions: ['ankle-sprain', 'plantar-heel'], name: '靠牆小腿伸展', shortName: '小腿伸展', image: '/exercises/calf-stretch.png',
    summary: '後腳跟踩地，溫和伸展小腿後側。', steps: ['面對牆站立，雙手扶牆，患側腳在後。', '後腳跟踩地、腳尖朝前，前膝慢慢彎曲。', '感到小腿拉伸後停留，再放鬆。'], keyCue: '後腳跟不要浮起；不需要用力壓到底。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'seated-calf-raise', conditions: ['plantar-heel', 'achilles'], name: '坐姿提踵', shortName: '坐姿提踵', image: '/exercises/calf-loading.png',
    summary: '坐姿將腳跟抬起，從較低負荷開始訓練小腿。', steps: ['坐在椅子上，雙腳踩地、膝蓋彎曲。', '前腳掌保持踩地，慢慢抬高腳跟。', '停一下，再慢慢將腳跟放回。'], keyCue: '速度要慢；可接受輕微症狀，但不要突然劇痛。', dose: { type: 'reps', reps: 10, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'calf-raise-isometric', conditions: ['achilles'], name: '扶穩提踵等長', shortName: '提踵等長', image: '/exercises/calf-loading.png',
    summary: '扶穩後踮起腳跟，在可接受高度停住不動。', steps: ['雙腳與髖同寬站立，雙手扶穩桌面。', '慢慢踮起腳尖，到可接受高度後停住約 10 秒。', '保持呼吸，再慢慢將腳跟放回地面。'], keyCue: '先用雙腳平均承重；若隔天疼痛或腫脹明顯增加就減量。', dose: { type: 'reps', reps: 5, sets: 2, frequency: '每天 1 次' },
  },
  {
    id: 'calf-raise', conditions: ['ankle-sprain', 'plantar-heel', 'achilles'], name: '扶穩雙腳提踵', shortName: '雙腳提踵', image: '/exercises/calf-loading.png',
    summary: '扶穩後抬高腳跟，訓練小腿與跟腱負荷能力。', steps: ['雙腳與髖同寬站立，雙手扶穩。', '慢慢踮起腳尖，讓腳跟離地。', '停一下，再用至少 3 秒慢慢放下。'], keyCue: '重量平均；疼痛或腫脹隔天明顯增加就減量。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每週 3 次' },
  },
  {
    id: 'bent-knee-calf-raise', conditions: ['achilles'], name: '微屈膝提踵', shortName: '屈膝提踵', image: '/exercises/calf-loading.png',
    summary: '膝蓋微彎保持不動，再做緩慢提踵。', steps: ['雙手扶穩，雙腳站立，膝蓋微微彎曲。', '維持膝蓋角度，慢慢將腳跟抬高。', '停一下，再用至少 3 秒慢慢放下。'], keyCue: '膝蓋不要內夾；先雙腳，耐受後才考慮單腳。', dose: { type: 'reps', reps: 8, sets: 2, frequency: '每週 3 次' },
  },
]

export const getExercise = (id: string) => exercises.find((exercise) => exercise.id === id)
export const getSubtype = (id: string) => subtypes.find((subtype) => subtype.id === id)
export const getCondition = (id: ConditionId) => conditions.find((condition) => condition.id === id)!
export const conditionName = (id: ConditionId) => getCondition(id)?.name ?? ''
