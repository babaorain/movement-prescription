import type { FlowStep } from '../../types'

/** 頸部、肩部、肘腕手的症狀導引。步驟可跨部位互相指向（例如手麻回到頸椎分支）。 */
export const upperFlow: FlowStep[] = [
  // ── 頸部 ────────────────────────────────────────────────────
  {
    id: 'neck-redflags', region: 'neck', kind: 'redflag',
    title: '頸部警訊篩檢',
    detail: '勾選任一項就不產生居家運動處方。',
    flags: [
      '重大外傷後頸痛，或符合加拿大頸椎準則的高風險條件（尚未排除骨折）',
      '走路不穩、雙手變笨拙、雙側手麻、反射亢進（疑似頸髓病變）',
      '發燒、不明原因體重減輕、癌症病史，或夜間持續痛醒',
      '突發劇烈頭痛、複視、講話或吞嚥困難、暈眩合併神經學缺損',
      '進行性的肌肉無力或萎縮',
    ],
    referTitle: '先安排進一步評估，暫不開立居家運動',
    referDetail: '依警訊性質安排影像、實驗室檢查或轉介神經外科／神經內科／感染科；必要時直接送急診。',
    clear: { kind: 'step', id: 'neck-q1' },
  },
  {
    id: 'neck-q1', region: 'neck', kind: 'history',
    title: '症狀的主要範圍在哪裡？',
    options: [
      { label: '只有脖子與肩頸周圍', detail: '不往手臂延伸', target: { kind: 'step', id: 'neck-q2' } },
      { label: '頭痛為主，脖子是次要', detail: '頭痛才是病人最在意的問題', target: { kind: 'step', id: 'neck-q3' } },
      { label: '延伸到手臂或手指', detail: '有麻、放射痛或無力', target: { kind: 'step', id: 'neck-q4' } },
      { label: '下顎、耳前、咀嚼時痛', detail: '張口受限或有喀聲', target: { kind: 'condition', id: 'tmj' } },
    ],
  },
  {
    id: 'neck-q2', region: 'neck', kind: 'history',
    title: '這次症狀是怎麼開始的？',
    options: [
      { label: '車禍或撞擊之後', detail: '已依準則排除骨折', target: { kind: 'condition', id: 'whiplash' } },
      { label: '姿勢、工作或睡姿相關', detail: '沒有明確外傷', target: { kind: 'step', id: 'neck-exam-rom' } },
      { label: '說不出明確原因', target: { kind: 'step', id: 'neck-exam-rom' } },
    ],
  },
  {
    id: 'neck-exam-rom', region: 'neck', kind: 'exam',
    title: '頸部主動活動度與觸診',
    method: '請病人做屈曲、伸直、雙側旋轉與側彎，記錄受限方向與末端疼痛；再觸診上斜方肌、提肩胛肌與上頸段（C1–C3）小面關節區。',
    options: [
      { label: '活動度受限、末端疼痛為主', detail: '無明確激痛點與轉移痛', target: { kind: 'condition', id: 'neck-pain' } },
      { label: '摸到緊繃帶與激痛點，按壓再現轉移痛', target: { kind: 'condition', id: 'myofascial-neck' } },
      { label: '上頸段壓痛且再現病人的頭痛', target: { kind: 'condition', id: 'cervicogenic-headache' } },
    ],
  },
  {
    id: 'neck-q3', region: 'neck', kind: 'history',
    title: '頭痛的型態比較接近哪一種？',
    options: [
      { label: '單側固定、從後頸往上、頸部活動會誘發', target: { kind: 'step', id: 'neck-exam-c1c3' } },
      { label: '兩側或會換邊、合併畏光噁心、與頸部無關', target: { kind: 'refer', title: '較符合原發性頭痛', detail: '建議依頭痛型態處理或轉介神經內科；此時不宜以頸源性頭痛開立運動處方。' } },
      { label: '不確定，想先做頸部檢查', target: { kind: 'step', id: 'neck-exam-c1c3' } },
    ],
  },
  {
    id: 'neck-exam-c1c3', region: 'neck', kind: 'exam',
    title: '上頸段觸診與頸椎屈曲旋轉測試',
    method: '觸診 C1–C3 小面關節區，確認是否再現病人熟悉的頭痛；再於頸椎完全屈曲下做左右被動旋轉，比較兩側角度（正常約 44 度，兩側差異大於 10 度視為受限）。',
    options: [
      { label: '陽性：再現頭痛或旋轉明顯不對稱', target: { kind: 'condition', id: 'cervicogenic-headache' } },
      { label: '陰性：無法再現頭痛且旋轉對稱', target: { kind: 'refer', title: '頸部來源證據不足', detail: '建議重新鑑別偏頭痛、緊縮型頭痛或其他次發性頭痛，不建議直接以頸源性頭痛開立處方。' } },
    ],
  },
  {
    id: 'neck-q4', region: 'neck', kind: 'history',
    title: '手臂症狀的分布與誘發因素？',
    options: [
      { label: '沿單一皮節往手指，咳嗽用力會加重', target: { kind: 'step', id: 'neck-exam-spurling' } },
      { label: '整隻手臂脹麻，抬手或提重物後加重', target: { kind: 'step', id: 'neck-exam-tos' } },
      { label: '只在手腕以下，夜間麻醒', target: { kind: 'step', id: 'arm-q-nerve' } },
    ],
  },
  {
    id: 'neck-exam-spurling', region: 'neck', kind: 'exam',
    title: 'Spurling 測試與神經學檢查',
    method: '頸部伸直並向患側側彎旋轉後，於頭頂施加軸向壓力，觀察是否再現放射痛；同時檢查各皮節感覺、肌力（C5–T1）與反射。',
    options: [
      { label: '陽性：再現手臂放射症狀', target: { kind: 'condition', id: 'cervical-radiculopathy' } },
      { label: '陰性但有明確皮節分布', detail: 'Spurling 敏感度不高，陰性無法完全排除', target: { kind: 'condition', id: 'cervical-radiculopathy' } },
      { label: '陰性且分布不符皮節', detail: '較像轉移痛', target: { kind: 'condition', id: 'neck-pain' } },
    ],
  },
  {
    id: 'neck-exam-tos', region: 'neck', kind: 'exam',
    title: '上舉壓力測試（Roos／EAST）',
    method: '雙臂外展 90 度、外轉，手肘屈曲 90 度，持續開合手掌 3 分鐘，記錄是否再現患側的麻脹或無力；同時檢查橈動脈搏動與手部顏色。',
    options: [
      { label: '陽性：再現患側症狀', target: { kind: 'condition', id: 'thoracic-outlet' } },
      { label: '陽性且合併脈搏減弱或膚色改變', target: { kind: 'refer', title: '疑似血管型胸廓出口症候群', detail: '需安排血管影像評估並轉介，暫不開立居家運動。' } },
      { label: '陰性', target: { kind: 'condition', id: 'neck-pain' } },
    ],
  },

  // ── 肩部 ────────────────────────────────────────────────────
  {
    id: 'shoulder-redflags', region: 'shoulder', kind: 'redflag',
    title: '肩部警訊篩檢',
    detail: '勾選任一項就不產生居家運動處方。',
    flags: [
      '肩或上背不適合併胸悶、喘、冒冷汗、噁心（先排除心因性）',
      '外傷後無法主動抬手、肩部明顯變形或疑似骨折／脫位',
      '關節紅腫熱合併發燒（疑似化膿性關節炎）',
      '癌症病史合併夜間持續痛、不明原因體重減輕',
      '進行性的三角肌萎縮或明顯神經學缺損',
    ],
    referTitle: '先安排進一步評估，暫不開立居家運動',
    referDetail: '依警訊性質安排心臟評估、X 光、抽血或轉介骨科；懷疑心因性或感染時請立即處理。',
    clear: { kind: 'step', id: 'shoulder-q1' },
  },
  {
    id: 'shoulder-q1', region: 'shoulder', kind: 'history',
    title: '症狀的起因與型態比較接近哪一種？',
    options: [
      { label: '逐漸變僵硬，別人幫忙抬也抬不高', target: { kind: 'step', id: 'shoulder-exam-passive' } },
      { label: '抬手到中段會痛，放下就還好', target: { kind: 'step', id: 'shoulder-exam-impingement' } },
      { label: '突發極劇烈疼痛，數天內達到高峰', detail: '影像上常見鈣化', target: { kind: 'condition', id: 'calcific-tendinitis' } },
      { label: '曾脫臼，或有滑脫、不安定感', target: { kind: 'condition', id: 'shoulder-instability' } },
    ],
  },
  {
    id: 'shoulder-exam-passive', region: 'shoulder', kind: 'exam',
    title: '主動與被動活動度比較',
    method: '在肩胛固定下測量被動外轉、外展與屈曲，並與主動角度比較。五十肩的典型是被動外轉受限最明顯（capsular pattern）。',
    options: [
      { label: '被動外轉明顯受限，主動被動一樣受限', target: { kind: 'condition', id: 'shoulder' } },
      { label: '被動接近正常，只有主動受限', target: { kind: 'step', id: 'shoulder-exam-strength' } },
    ],
  },
  {
    id: 'shoulder-exam-impingement', region: 'shoulder', kind: 'exam',
    title: '夾擠與肌腱測試',
    method: '做 painful arc（60–120 度）、Hawkins-Kennedy、Jobe（空罐）測試；再觸診結節間溝並做 Speed／Yergason 測試。',
    options: [
      { label: '疼痛弧陽性、Jobe 會痛但力量尚可', target: { kind: 'condition', id: 'rotator-cuff' } },
      { label: 'Jobe 明顯無力或 drop arm 陽性', target: { kind: 'step', id: 'shoulder-exam-strength' } },
      { label: '痛點集中在肩前方溝槽，Speed／Yergason 陽性', target: { kind: 'condition', id: 'biceps-tendinopathy' } },
      { label: '肩膀最上方局部壓痛', detail: '手指可精準指出痛點', target: { kind: 'step', id: 'shoulder-exam-ac' } },
    ],
  },
  {
    id: 'shoulder-exam-strength', region: 'shoulder', kind: 'exam',
    title: '旋轉肌肌力與肩胛節律',
    method: '測試外轉阻力、Jobe、lift-off／belly-press 與 drop arm；同時從後方觀察抬手與放下時的肩胛節律。',
    options: [
      { label: '明顯無力或 drop arm 陽性', detail: '疑似大範圍撕裂', target: { kind: 'condition', id: 'rotator-cuff-tear' } },
      { label: '力量尚可，以疼痛為主', target: { kind: 'condition', id: 'rotator-cuff' } },
      { label: '力量正常，但肩胛節律明顯異常', target: { kind: 'condition', id: 'scapular-dyskinesis' } },
    ],
  },
  {
    id: 'shoulder-exam-ac', region: 'shoulder', kind: 'exam',
    title: '肩鎖關節評估',
    method: '直接觸診肩鎖關節，並做 cross-body adduction 與 O’Brien 測試，確認是否再現關節正上方的疼痛。',
    options: [
      { label: '陽性：局部壓痛且內收測試再現疼痛', target: { kind: 'condition', id: 'ac-joint' } },
      { label: '陰性：痛點其實偏向肩峰下', target: { kind: 'step', id: 'shoulder-exam-impingement' } },
    ],
  },

  // ── 肘、腕、手 ──────────────────────────────────────────────
  {
    id: 'arm-redflags', region: 'elbow-hand', kind: 'redflag',
    title: '肘腕手警訊篩檢',
    detail: '勾選任一項就不產生居家運動處方。',
    flags: [
      '外傷後明顯變形、無法活動，或解剖鼻煙壺壓痛（疑似舟狀骨骨折）',
      '關節紅腫熱合併發燒（疑似化膿性關節炎或感染性腱鞘炎）',
      '手部小肌肉萎縮、爪形手或進行性無力',
      '多關節對稱腫痛、晨僵超過 1 小時（疑似發炎性關節炎）',
      '手指發白發紫、冰冷或脈搏摸不到（血管問題）',
    ],
    referTitle: '先安排進一步評估，暫不開立居家運動',
    referDetail: '依警訊性質安排 X 光、抽血、神經傳導檢查，或轉介手外科／風濕免疫科。',
    clear: { kind: 'step', id: 'arm-q1' },
  },
  {
    id: 'arm-q1', region: 'elbow-hand', kind: 'history',
    title: '病人最主要的問題是哪一種？',
    options: [
      { label: '麻木或刺痛為主', target: { kind: 'step', id: 'arm-q-nerve' } },
      { label: '疼痛為主，與用力或握持有關', target: { kind: 'step', id: 'arm-q-pain' } },
      { label: '手指卡住、伸不直或有彈響', target: { kind: 'condition', id: 'trigger-finger' } },
      { label: '關節腫大、僵硬或變形', target: { kind: 'step', id: 'arm-q-joint' } },
    ],
  },
  {
    id: 'arm-q-nerve', region: 'elbow-hand', kind: 'history',
    title: '麻木的分布在哪裡？',
    options: [
      { label: '拇指、食指、中指，夜間會麻醒', target: { kind: 'step', id: 'arm-exam-median' } },
      { label: '小指與無名指，手肘彎久會加重', target: { kind: 'step', id: 'arm-exam-ulnar' } },
      { label: '整隻手臂脹麻，抬手後加重', target: { kind: 'step', id: 'neck-exam-tos' } },
      { label: '從頸部沿單一皮節往下', target: { kind: 'step', id: 'neck-exam-spurling' } },
    ],
  },
  {
    id: 'arm-exam-median', region: 'elbow-hand', kind: 'exam',
    title: '正中神經評估',
    method: '做 Phalen 與腕部 Tinel，並以腕隧道壓迫測試（拇指持續加壓 30 秒）確認；同時檢查大魚際肌體積與拇指外展肌力。',
    options: [
      { label: '陽性：再現正中神經分布的麻木', target: { kind: 'condition', id: 'carpal-tunnel' } },
      { label: '陽性且已有大魚際肌萎縮', target: { kind: 'refer', title: '中重度腕隧道症候群', detail: '建議安排神經傳導檢查並轉介手外科評估手術；居家運動不足以處理已萎縮的病灶。' } },
      { label: '陰性', target: { kind: 'refer', title: '腕隧道證據不足', detail: '建議重新鑑別頸神經根病變、旋前圓肌症候群或多發性神經病變，必要時安排神經傳導檢查。' } },
    ],
  },
  {
    id: 'arm-exam-ulnar', region: 'elbow-hand', kind: 'exam',
    title: '尺神經評估',
    method: '做肘部 Tinel 與 elbow flexion test（手肘完全屈曲並維持 60 秒）；檢查 Froment 徵象、手指外展肌力與第一背側骨間肌體積。',
    options: [
      { label: '陽性：再現小指側麻木', target: { kind: 'condition', id: 'cubital-tunnel' } },
      { label: '陽性且已有肌肉萎縮或 Froment 陽性', target: { kind: 'refer', title: '中重度尺神經病變', detail: '建議安排神經傳導檢查並轉介手外科評估減壓手術。' } },
      { label: '陰性', target: { kind: 'refer', title: '尺神經病變證據不足', detail: '建議重新鑑別 C8–T1 神經根病變、Guyon 管壓迫或胸廓出口症候群。' } },
    ],
  },
  {
    id: 'arm-q-pain', region: 'elbow-hand', kind: 'history',
    title: '疼痛的位置在哪裡？',
    options: [
      { label: '手肘外側', target: { kind: 'step', id: 'arm-exam-lateral' } },
      { label: '手肘內側', target: { kind: 'step', id: 'arm-exam-medial' } },
      { label: '手腕橈側或拇指根部', target: { kind: 'step', id: 'arm-exam-radial' } },
      { label: '手腕尺側（小指側）', detail: '旋轉、撐地時加重', target: { kind: 'condition', id: 'tfcc' } },
    ],
  },
  {
    id: 'arm-exam-lateral', region: 'elbow-hand', kind: 'exam',
    title: '外側肘痛測試',
    method: '觸診肱骨外上髁；做 Cozen（抗阻伸腕）與 Mill 測試，並測量握力在手肘伸直與屈曲時的差異。',
    options: [
      { label: '陽性：抗阻伸腕再現外上髁疼痛', target: { kind: 'condition', id: 'lateral-elbow' } },
      { label: '陰性，但合併頸部或肩部症狀', target: { kind: 'step', id: 'neck-exam-spurling' } },
      { label: '陰性且痛點不明確', target: { kind: 'refer', title: '外側肘痛來源不明確', detail: '建議重新鑑別橈隧道症候群、肘關節內病灶或轉移痛後再開立。' } },
    ],
  },
  {
    id: 'arm-exam-medial', region: 'elbow-hand', kind: 'exam',
    title: '內側肘痛測試',
    method: '觸診肱骨內上髁；做抗阻屈腕與抗阻前臂旋前測試，並同時檢查尺神經（Tinel、elbow flexion test）。',
    options: [
      { label: '陽性且無尺神經症狀', target: { kind: 'condition', id: 'medial-elbow' } },
      { label: '合併小指側麻木', target: { kind: 'step', id: 'arm-exam-ulnar' } },
      { label: '陰性', target: { kind: 'refer', title: '內側肘痛來源不明確', detail: '建議評估尺側副韌帶、肘關節內病灶或頸椎轉移痛。' } },
    ],
  },
  {
    id: 'arm-exam-radial', region: 'elbow-hand', kind: 'exam',
    title: '腕橈側與拇指根部測試',
    method: '做 Finkelstein／Eichhoff 測試（拇指握入掌心後腕部尺偏）；再做拇指腕掌關節的 grind test，並觸診解剖鼻煙壺排除舟狀骨壓痛。',
    options: [
      { label: 'Finkelstein 陽性，痛在第一背側腔室', target: { kind: 'condition', id: 'dequervain' } },
      { label: 'Grind test 陽性，痛在腕掌關節本身', target: { kind: 'condition', id: 'thumb-cmc-oa' } },
      { label: '鼻煙壺明顯壓痛且有外傷史', target: { kind: 'refer', title: '疑似舟狀骨骨折', detail: '需安排 X 光；初期 X 光可能正常，必要時固定後追蹤或安排進一步影像。' } },
    ],
  },
  {
    id: 'arm-q-joint', region: 'elbow-hand', kind: 'history',
    title: '受影響的是哪些關節？',
    options: [
      { label: '遠端與近端指間關節腫大，晨僵少於 30 分鐘', target: { kind: 'condition', id: 'hand-oa' } },
      { label: '主要在拇指根部，捏握時痛', target: { kind: 'condition', id: 'thumb-cmc-oa' } },
      { label: '多關節對稱腫痛，晨僵超過 1 小時', target: { kind: 'refer', title: '疑似發炎性關節炎', detail: '建議安排發炎指標與自體抗體檢查並轉介風濕免疫科，先確立診斷再安排運動。' } },
      { label: '骨折固定拆除後的僵硬與無力', target: { kind: 'condition', id: 'distal-radius-recovery' } },
    ],
  },
]
