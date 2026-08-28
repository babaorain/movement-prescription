import type { FlowStep } from '../../types'

/** 胸腰背、髖與骨盆、膝、足踝小腿的症狀導引。 */
export const lowerFlow: FlowStep[] = [
  // ── 胸腰背 ──────────────────────────────────────────────────
  {
    id: 'spine-redflags', region: 'spine', kind: 'redflag',
    title: '脊椎警訊篩檢',
    detail: '勾選任一項就不產生居家運動處方。',
    flags: [
      '大小便失禁或解不出來、會陰或大腿內側麻木（馬尾症候群）',
      '重大外傷，或骨質疏鬆者輕微外力後劇痛（疑似骨折）',
      '癌症病史、不明原因體重減輕、夜間持續痛醒',
      '發燒、近期感染、靜脈注射藥物或免疫低下（疑似感染）',
      '進行性的下肢無力、足下垂或步態變差',
    ],
    referTitle: '先安排進一步評估，暫不開立居家運動',
    referDetail: '馬尾症候群徵象請立即急診；其餘依警訊安排影像、抽血或轉介神經外科／腫瘤科／感染科。',
    clear: { kind: 'step', id: 'spine-q1' },
  },
  {
    id: 'spine-q1', region: 'spine', kind: 'history',
    title: '症狀的主要範圍在哪裡？',
    options: [
      { label: '腰部與臀部，不超過膝蓋', target: { kind: 'step', id: 'spine-q2' } },
      { label: '腿部症狀明顯，超過膝蓋', target: { kind: 'step', id: 'spine-q-leg' } },
      { label: '上背或兩側肩胛之間', target: { kind: 'condition', id: 'thoracic-pain' } },
      { label: '年輕發病、晨僵超過 30 分鐘、活動後反而改善', target: { kind: 'step', id: 'spine-exam-ibp' } },
      { label: '骨質疏鬆病史，輕微外力後背痛且已確認為穩定期', target: { kind: 'condition', id: 'vertebral-fracture' } },
    ],
  },
  {
    id: 'spine-q2', region: 'spine', kind: 'history',
    title: '什麼動作或姿勢最痛？',
    options: [
      { label: '後仰、轉身、久站加重；前彎反而舒服', target: { kind: 'step', id: 'spine-exam-facet' } },
      { label: '前彎、久坐、起身時加重', target: { kind: 'condition', id: 'low-back' } },
      { label: '單側臀部上方一個點，翻身與單腳承重時痛', target: { kind: 'step', id: 'spine-exam-si' } },
      { label: '沒有明確方向或姿勢關聯', target: { kind: 'condition', id: 'low-back' } },
    ],
  },
  {
    id: 'spine-q-leg', region: 'spine', kind: 'history',
    title: '腿部症狀的型態比較接近哪一種？',
    options: [
      { label: '走一段路才出現，坐下或前彎很快改善', target: { kind: 'step', id: 'spine-exam-stenosis' } },
      { label: '咳嗽用力會加重，沿單一皮節往下', target: { kind: 'step', id: 'spine-exam-slr' } },
      { label: '臀部深處痛，久坐加重，不太超過膝蓋', target: { kind: 'condition', id: 'deep-gluteal' } },
    ],
  },
  {
    id: 'spine-exam-slr', region: 'spine', kind: 'exam',
    title: '直腿抬高與神經學檢查',
    method: '仰躺做 SLR（30–70 度再現腿部放射症狀為陽性）與 crossed SLR；檢查 L4–S1 的皮節感覺、肌力（勾腳、墊腳、伸拇趾）與膝踝反射。',
    options: [
      { label: '陽性且神經學檢查符合單一神經根', target: { kind: 'condition', id: 'lumbar-radiculopathy' } },
      { label: '陽性但已有明顯足下垂或進行性無力', target: { kind: 'refer', title: '需優先評估手術適應症', detail: '進行性運動缺損屬於相對緊急，建議安排影像並轉介神經外科／骨科脊椎科。' } },
      { label: '陰性，但走路才會出現症狀', target: { kind: 'step', id: 'spine-exam-stenosis' } },
    ],
  },
  {
    id: 'spine-exam-stenosis', region: 'spine', kind: 'exam',
    title: '跛行型態鑑別',
    method: '記錄可行走距離與緩解姿勢；比較「站立後仰」與「坐姿前彎」的症狀變化；觸診足背動脈與脛後動脈搏動，必要時做腳踏車測試。',
    options: [
      { label: '前彎或坐下改善、脈搏正常', detail: '符合神經性跛行', target: { kind: 'condition', id: 'lumbar-stenosis' } },
      { label: '前彎不改善、脈搏減弱或與運動量固定相關', target: { kind: 'refer', title: '疑似血管性跛行', detail: '建議測量 ABI 並轉介心臟血管科；此時不宜以脊椎狹窄開立運動處方。' } },
      { label: '症狀與姿勢無明確關係', target: { kind: 'condition', id: 'low-back' } },
    ],
  },
  {
    id: 'spine-exam-facet', region: 'spine', kind: 'exam',
    title: '伸直旋轉測試與棘突觸診',
    method: '做腰椎伸直併同側旋轉（Kemp 測試），觀察是否再現同側腰痛；沿棘突觸診有無階梯感，並確認是否有已知的滑脫影像。',
    options: [
      { label: '再現同側腰痛，棘突無階梯感', target: { kind: 'condition', id: 'facet-pain' } },
      { label: '觸診有階梯感，或影像已知滑脫', target: { kind: 'condition', id: 'spondylolisthesis' } },
      { label: '無法再現症狀', target: { kind: 'condition', id: 'low-back' } },
    ],
  },
  {
    id: 'spine-exam-si', region: 'spine', kind: 'exam',
    title: '薦髂關節誘發測試組',
    method: '依序做 distraction、thigh thrust、compression、sacral thrust 與 Gaenslen；三項以上陽性才視為有意義。',
    options: [
      { label: '三項以上陽性', target: { kind: 'condition', id: 'si-joint' } },
      { label: '少於三項陽性', target: { kind: 'condition', id: 'low-back' } },
    ],
  },
  {
    id: 'spine-exam-ibp', region: 'spine', kind: 'history',
    title: '發炎性背痛特徵確認',
    detail: '45 歲前發病、隱匿發作、晨僵超過 30 分鐘、休息不會改善、活動後改善、夜間下半夜痛醒、對 NSAID 反應良好。',
    options: [
      { label: '符合四項以上', target: { kind: 'condition', id: 'axial-spa' } },
      { label: '符合但尚未經風濕免疫科評估', target: { kind: 'refer', title: '建議先確立診斷', detail: '安排發炎指標、HLA-B27 與薦髂關節影像，並轉介風濕免疫科；藥物控制發炎是運動能否有效的前提。' } },
      { label: '不符合', target: { kind: 'condition', id: 'low-back' } },
    ],
  },

  // ── 髖與骨盆 ────────────────────────────────────────────────
  {
    id: 'hip-redflags', region: 'hip', kind: 'redflag',
    title: '髖部警訊篩檢',
    detail: '勾選任一項就不產生居家運動處方。',
    flags: [
      '跌倒後無法承重、腿長或旋轉角度改變（疑似骨折或脫位）',
      '發燒合併髖部劇痛（疑似化膿性關節炎）',
      '癌症病史合併夜間持續痛、不明原因體重減輕',
      '兒童或青少年髖／膝痛且跛行（須排除 SCFE、Perthes、化膿性關節炎）',
      '長期類固醇、酗酒或鐮刀型貧血病史合併鼠蹊痛（疑似股骨頭壞死）',
    ],
    referTitle: '先安排進一步評估，暫不開立居家運動',
    referDetail: '依警訊安排 X 光或 MRI、抽血，並轉介骨科；兒童髖痛與疑似感染請當日處理。',
    clear: { kind: 'step', id: 'hip-q1' },
  },
  {
    id: 'hip-q1', region: 'hip', kind: 'history',
    title: '請病人用手指出最痛的位置',
    options: [
      { label: '鼠蹊部或大腿前側', target: { kind: 'step', id: 'hip-exam-groin' } },
      { label: '大腿外側、大轉子附近', detail: '側睡壓到會痛', target: { kind: 'step', id: 'hip-exam-lateral' } },
      { label: '臀部深處，久坐加重', target: { kind: 'condition', id: 'deep-gluteal' } },
      { label: '坐骨結節（屁股骨頭），坐著與跑步痛', target: { kind: 'condition', id: 'hamstring-tendinopathy' } },
      { label: '人工髖關節置換術後的復健需求', target: { kind: 'condition', id: 'post-hip-replacement' } },
    ],
  },
  {
    id: 'hip-exam-groin', region: 'hip', kind: 'exam',
    title: '髖關節活動度、FADIR 與 FABER',
    method: '仰躺測量髖屈曲、內旋與外旋角度並與對側比較；做 FADIR（屈曲內收內旋）與 FABER 測試，記錄是否再現鼠蹊痛。',
    options: [
      { label: '整體活動度受限、內旋最明顯，年紀較大', target: { kind: 'condition', id: 'hip-oa' } },
      { label: 'FADIR 陽性、活動度大致保留、較年輕', target: { kind: 'condition', id: 'fai' } },
      { label: '抗阻內收會痛、痛點在大腿內側', target: { kind: 'condition', id: 'adductor-strain' } },
      { label: '皆陰性', target: { kind: 'refer', title: '髖關節來源證據不足', detail: '建議鑑別腰椎轉移痛、疝氣、骨盆腔或泌尿生殖來源後再開立。' } },
    ],
  },
  {
    id: 'hip-exam-lateral', region: 'hip', kind: 'exam',
    title: '大轉子觸診與單腳站立測試',
    method: '直接觸診大轉子後上方；請病人單腳站立 30 秒（必要時輕扶），記錄是否再現外側疼痛；再做抗阻髖外展。',
    options: [
      { label: '陽性：局部壓痛且單腳站立再現症狀', target: { kind: 'condition', id: 'gtps' } },
      { label: '陰性，但腰部活動會誘發', target: { kind: 'step', id: 'spine-q1' } },
      { label: '陰性且痛點不明確', target: { kind: 'refer', title: '外側髖痛來源不明確', detail: '建議鑑別腰椎轉移痛、薦髂關節或髖關節內病灶後再開立。' } },
    ],
  },

  // ── 膝 ──────────────────────────────────────────────────────
  {
    id: 'knee-redflags', region: 'knee', kind: 'redflag',
    title: '膝部警訊篩檢',
    detail: '勾選任一項就不產生居家運動處方。',
    flags: [
      '外傷後無法連走四步、關節明顯變形（依渥太華膝準則需 X 光）',
      '受傷後數小時內快速大量腫脹（疑似關節積血、十字韌帶或骨折）',
      '關節紅腫熱合併發燒（疑似化膿性關節炎或急性痛風）',
      '膝關節真正鎖住、無法完全伸直',
      '小腿單側腫脹壓痛、發熱（疑似深部靜脈栓塞）',
    ],
    referTitle: '先安排進一步評估，暫不開立居家運動',
    referDetail: '依警訊安排 X 光、關節液檢查或超音波；疑似感染、積血或栓塞請當日處理。',
    clear: { kind: 'step', id: 'knee-q1' },
  },
  {
    id: 'knee-q1', region: 'knee', kind: 'history',
    title: '請病人用手指出最痛的位置',
    options: [
      { label: '前方，膝蓋骨周圍', target: { kind: 'step', id: 'knee-exam-anterior' } },
      { label: '內側', target: { kind: 'step', id: 'knee-exam-medial' } },
      { label: '外側', target: { kind: 'step', id: 'knee-exam-lateral' } },
      { label: '整個膝蓋都痛、說不出明確一點', detail: '中老年、晨僵短、活動後改善', target: { kind: 'condition', id: 'knee-oa' } },
      { label: '人工膝關節置換術後的復健需求', target: { kind: 'condition', id: 'post-knee-replacement' } },
    ],
  },
  {
    id: 'knee-exam-anterior', region: 'knee', kind: 'exam',
    title: '前膝痛觸診與功能測試',
    method: '分別觸診髕腱、髕骨周緣與股四頭肌腱；請病人做單腳蹲與上下階，記錄疼痛出現的時機與位置。',
    options: [
      { label: '痛點集中在髕骨下緣的肌腱，跳躍或衝刺族群', target: { kind: 'condition', id: 'patellar-tendinopathy' } },
      { label: '瀰漫在髕骨周圍，上下樓與久坐後起身加重', target: { kind: 'condition', id: 'patellofemoral' } },
      { label: '合併關節腫脹、活動時有摩擦感，中老年', target: { kind: 'condition', id: 'knee-oa' } },
      { label: '十字韌帶損傷或術後的復健需求', target: { kind: 'condition', id: 'acl-recovery' } },
    ],
  },
  {
    id: 'knee-exam-medial', region: 'knee', kind: 'exam',
    title: '內側膝痛觸診與測試',
    method: '沿內側關節線觸診，並往下 3–5 公分觸診鵝足區；做 Thessaly 或 McMurray、以及 30 度外翻壓力測試。',
    options: [
      { label: '關節線壓痛、Thessaly 陽性，中老年無明確外傷', target: { kind: 'condition', id: 'meniscus-degenerative' } },
      { label: '外翻壓力測試疼痛或鬆弛，有外傷史', target: { kind: 'condition', id: 'mcl-sprain' } },
      { label: '壓痛在關節線下方 3–5 公分', target: { kind: 'condition', id: 'pes-anserine' } },
      { label: '合併明顯退化變化與晨僵', target: { kind: 'condition', id: 'knee-oa' } },
    ],
  },
  {
    id: 'knee-exam-lateral', region: 'knee', kind: 'exam',
    title: '外側膝痛測試',
    method: '觸診股骨外上髁與外側關節線；做 Noble 壓迫測試與 Ober 測試，並詢問症狀是否在固定跑走距離後出現。',
    options: [
      { label: 'Noble 陽性、跑走固定距離後發作', target: { kind: 'condition', id: 'itbs' } },
      { label: '外側關節線壓痛、旋轉測試陽性', target: { kind: 'condition', id: 'meniscus-degenerative' } },
      { label: '皆陰性', target: { kind: 'refer', title: '外側膝痛來源不明確', detail: '建議鑑別近端脛腓關節、外側副韌帶或轉移痛後再開立。' } },
    ],
  },

  // ── 足踝小腿 ────────────────────────────────────────────────
  {
    id: 'foot-redflags', region: 'foot-ankle', kind: 'redflag',
    title: '足踝警訊篩檢',
    detail: '勾選任一項就不產生居家運動處方。',
    flags: [
      '外傷後無法連走四步，或後踝／舟狀骨／第五蹠骨基部壓痛（依渥太華踝準則需 X 光）',
      '無法踮腳，跟腱可摸到凹陷、Thompson 測試陽性（疑似跟腱斷裂）',
      '紅腫熱合併發燒（疑似蜂窩性組織炎、化膿性關節炎或痛風）',
      '糖尿病足潰瘍、傷口或保護性感覺喪失',
      '小腿單側腫脹壓痛（DVT）；或靜息痛合併脈搏消失、皮膚蒼白（周邊動脈疾病）',
    ],
    referTitle: '先安排進一步評估，暫不開立居家運動',
    referDetail: '依警訊安排 X 光、超音波或血管評估；疑似跟腱斷裂、感染或栓塞請當日處理。',
    clear: { kind: 'step', id: 'foot-q1' },
  },
  {
    id: 'foot-q1', region: 'foot-ankle', kind: 'history',
    title: '請病人用手指出最痛的位置',
    options: [
      { label: '腳跟底部', detail: '下床第一步最痛', target: { kind: 'step', id: 'foot-exam-heel' } },
      { label: '腳跟後方、跟腱附近', target: { kind: 'step', id: 'foot-exam-achilles' } },
      { label: '腳踝外側', target: { kind: 'step', id: 'foot-exam-lateral' } },
      { label: '腳踝內側、足弓或前腳掌', target: { kind: 'step', id: 'foot-q-medial' } },
    ],
  },
  {
    id: 'foot-exam-heel', region: 'foot-ankle', kind: 'exam',
    title: '腳跟底部觸診與絞盤測試',
    method: '觸診跟骨內側結節；做 windlass test（承重下被動背屈大腳趾）；於跗隧道做 Tinel 排除神經來源。',
    options: [
      { label: '內側結節壓痛，windlass 陽性', target: { kind: 'condition', id: 'plantar-heel' } },
      { label: 'Tinel 陽性且有麻木或灼熱感', target: { kind: 'refer', title: '疑似跗隧道症候群', detail: '建議安排神經傳導檢查並重新評估；處理方式與足底筋膜炎不同。' } },
      { label: '壓痛集中在跟骨本身且休息也痛', target: { kind: 'refer', title: '疑似跟骨壓力性骨折', detail: '建議安排影像檢查，暫時限制衝擊性活動。' } },
    ],
  },
  {
    id: 'foot-exam-achilles', region: 'foot-ankle', kind: 'exam',
    title: '跟腱觸診與 Thompson 測試',
    method: '俯臥擠壓小腿觀察是否有蹠屈（Thompson）；再沿跟腱觸診，確認壓痛是在跟骨上方 2–6 公分的腱體，還是在跟骨附著處。',
    options: [
      { label: 'Thompson 陽性或摸到凹陷', target: { kind: 'refer', title: '疑似跟腱斷裂', detail: '立即以蹠屈姿勢固定並轉介骨科，禁止任何負荷訓練。' } },
      { label: '壓痛在跟骨上方 2–6 公分', target: { kind: 'condition', id: 'achilles' } },
      { label: '壓痛在跟骨附著處，穿鞋摩擦更痛', target: { kind: 'condition', id: 'insertional-achilles' } },
    ],
  },
  {
    id: 'foot-exam-lateral', region: 'foot-ankle', kind: 'exam',
    title: '踝外側韌帶與腓骨肌評估',
    method: '觸診 ATFL、CFL 與腓骨肌走向；做前拉測試（anterior drawer）與距骨傾斜測試；再做抗阻外翻測試。',
    options: [
      { label: '急性扭傷，ATFL 壓痛或前拉測試鬆弛', target: { kind: 'condition', id: 'ankle-sprain' } },
      { label: '反覆扭傷、走不平路會軟', target: { kind: 'condition', id: 'chronic-ankle-instability' } },
      { label: '抗阻外翻疼痛、沿腓骨肌腱走向壓痛', target: { kind: 'condition', id: 'peroneal-tendinopathy' } },
      { label: '關節整體僵硬、活動範圍受限，有舊骨折史', target: { kind: 'condition', id: 'ankle-oa' } },
    ],
  },
  {
    id: 'foot-q-medial', region: 'foot-ankle', kind: 'history',
    title: '再細分位置與型態',
    options: [
      { label: '內踝後方痛、足弓逐漸塌陷', target: { kind: 'step', id: 'foot-exam-medial' } },
      { label: '前腳掌痛，像踩到石頭，或腳趾間麻', target: { kind: 'condition', id: 'metatarsalgia' } },
      { label: '大腳趾根部變形、僵硬或摩擦痛', target: { kind: 'condition', id: 'hallux-valgus' } },
      { label: '小腿內側沿脛骨一片痠痛，跑走後加重', target: { kind: 'condition', id: 'mtss' } },
    ],
  },
  {
    id: 'foot-exam-medial', region: 'foot-ankle', kind: 'exam',
    title: '脛後肌腱評估',
    method: '從後方觀察 too-many-toes 徵象；做抗阻內翻測試；請病人做單腳踮腳，觀察後足能否內翻，並記錄可完成的次數。',
    options: [
      { label: '抗阻內翻痛、單腳踮腳困難或後足不內翻', target: { kind: 'condition', id: 'tibialis-posterior' } },
      { label: '足弓塌陷但無痛、活動正常', target: { kind: 'refer', title: '無症狀的扁平足', detail: '不需要運動處方；提供鞋具建議並觀察即可。' } },
      { label: '疼痛其實在關節內、活動範圍受限', target: { kind: 'condition', id: 'ankle-oa' } },
    ],
  },
]
