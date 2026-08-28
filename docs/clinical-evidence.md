# 臨床內容依據與使用邊界

更新日：2026-08-11

## 產品定位

本工具是**醫師端**的運動處方工具，不是病人自我診斷器。2026-08 這一版加入了「從症狀開始」的導引流程，
但它的性質是**鑑別提示與流程備忘**，不是經過驗證的診斷演算法：

- 每一條路徑都由醫師逐題選擇，包含理學檢查的結果由醫師自己判讀後輸入。
- 導引的終點是「建議方向」，必須由醫師按下「採用這個診斷」才會生效；醫師隨時可改用診斷庫自行指定。
- 各步驟採用的測試（Spurling、Hawkins、Thessaly、FADIR、Windlass、Thompson 等）本身的敏感度與特異度
  都有限。症狀導引只記錄「陽性／陰性」；另設的醫師 PE／DD 工作台會顯示經來源核對的 Sn／Sp 與限制，但仍不換算疾病機率或診斷信心分數。詳見 [`pe-evidence.md`](pe-evidence.md)。
- 每個部位的第一步都是紅旗篩檢；勾選任一項就直接停在轉介建議，不會產生 QR。
- 部分診斷另設「適用邊界」勾選（如跟腱中段與附著點型、壓迫性骨折穩定期、術後階段），未勾選時 QR 維持鎖定。

診斷、分期、警訊排除與是否適合居家運動，均由開立醫師決定。介面中的次數、組數與頻率是可調整的實作預設值，
不代表臨床指引對所有病人的固定劑量。

## 涵蓋範圍

7 個部位、61 個骨骼肌肉診斷、125 個臨床分型、121 個動作、50 個導引步驟。
不涵蓋神經復健、心肺復健、癌症與淋巴水腫、骨盆底、兒童發展等其他復健次專科。

| 部位 | 診斷數 | 內容重點 |
|---|---|---|
| 頸部 | 7 | 非特異性頸痛、神經根病變、頸源性頭痛、揮鞭式傷害、肌筋膜疼痛、顳顎關節障礙、胸廓出口 |
| 肩部 | 8 | 五十肩、旋轉肌肌腱病與撕裂、鈣化性肌腱炎、二頭肌長頭、肩鎖關節、不穩定、肩胛動作異常 |
| 肘腕手 | 10 | 內外側肘痛、肘隧道、腕隧道、狹窄性腱鞘炎、板機指、拇指 CMC、手部 OA、TFCC、骨折固定後 |
| 胸腰背 | 9 | 非特異性下背痛、神經根病變、椎管狹窄、小面關節、薦髂、滑脫、壓迫性骨折、胸椎痛、發炎性背痛 |
| 髖與骨盆 | 7 | 髖 OA、GTPS、FAI、內收肌拉傷、近端腿後肌腱病、深臀症候群、髖置換術後 |
| 膝 | 9 | 膝 OA、髕股疼痛、髕腱病、退化性半月板、MCL、ACL 恢復期、鵝足、ITBS、膝置換術後 |
| 足踝小腿 | 11 | 急慢性踝扭傷、足底跟痛、跟腱中段與附著點、腓骨肌腱、脛後肌腱、MTSS、蹠骨痛、拇趾、踝 OA |

## 運動方向的主要依據

### 有正式臨床指引（CPG）支持

| 問題 | 本工具採用的核心方向 | 主要依據 | 證據／限制 |
|---|---|---|---|
| 頸部疼痛 | 頸部活動、頸肩控制、肩胛帶肌力／耐力 | [JOSPT Neck Pain CPG, 2017](https://pubmed.ncbi.nlm.nih.gov/28666405/) | 臨床指引；需依急慢性與分類調整。揮鞭式與頸源性頭痛屬同一指引的次分類 |
| 五十肩 | 依組織敏感度分期，從舒適活動至漸進伸展 | [APTA Adhesive Capsulitis CPG](https://orthopt.org/uploads/content_files/ICF/Updated_Guidelines/Shoulder_Pain__Mobility_Deficits_Adhesive_Capsulitis_Clinical_Practice_Guideline___2012_06_22_version.pdf) | 舊版指引；新版仍在修訂中，需醫師個別化 |
| 旋轉肌相關肩痛 | 主動復健、動作控制與漸進阻力 | [Rotator Cuff Tendinopathy CPG, 2025](https://pubmed.ncbi.nlm.nih.gov/40165544/) | 指引建議初始採主動復健；最佳劑量仍須個別化 |
| 外側肘痛 | 伸腕肌等長、向心／離心阻力與漸進負荷 | [JOSPT Lateral Elbow Pain CPG, 2022](https://www.orthopt.org/content/s/lateral-elbow-pain-and-muscle-function-impairments) | 指引支持等長、向心及／或離心阻力訓練 |
| 腕隧道症候群 | 夜間中立位副木、神經與肌腱滑動、活動調整 | AAOS《Management of Carpal Tunnel Syndrome》CPG（連結待補） | 副木證據較強；已萎縮或中重度者介面直接導向手術評估 |
| 下背痛 | 一般活動、軀幹訓練；有明確方向偏好才選方向性動作 | [JOSPT Low Back Pain CPG, 2021](https://www.orthopt.org/content/s/interventions-for-the-management-of-acute-and-chronic-low-back-pain-revision-2021) | 介面另設方向確認與神經性跛行快篩，避免機械套用 |
| 髖關節退化 | 肌力、柔軟度、功能與有氧活動 | [JOSPT Hip OA CPG, 2025](https://www.orthopt.org/news/new-2025-hip-oa-clinical-practice-guideline-now-available) | 新版指引支持個別化肌力、柔軟度、耐力與功能訓練 |
| 外側髖痛 | 降低壓迫姿勢、漸進臀肌負荷與功能訓練 | [ISHA GTPS Consensus, 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC10234389/) | 共識文件，確定性低於正式 CPG；預設須由醫師覆核 |
| 膝關節退化 | 活動度、股四頭肌與漸進功能／有氧訓練 | [AAOS Knee OA CPG, 2021](https://www.aaos.org/quality/quality-programs/osteoarthritis-of-the-knee/) | 強烈建議監督、非監督或水中運動；本工具僅提供陸上簡化版本 |
| 髕股疼痛 | 髖外側與膝部共同訓練 | [JOSPT Patellofemoral Pain CPG, 2019](https://doi.org/10.2519/jospt.2019.0302) | 指引偏好髖與膝共同訓練；早期可較偏重髖部 |
| 退化性半月板撕裂 | 以運動治療為第一線，非機械性鎖住者不優先手術 | ESSKA 退化性半月板共識與 METEOR／FIDELITY 等試驗（連結待補） | 運動治療與關節鏡效果相當；真正鎖住者例外，介面列為紅旗 |
| 踝扭傷恢復 | 漸進承重、活動度、肌力、本體感覺與平衡 | [JOSPT Lateral Ankle Sprain CPG, 2021](https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf) | 指引支持漸進承重；平衡／本體訓練可降低再扭傷風險 |
| 足底跟痛 | 足底筋膜特定伸展、小腿伸展與漸進負荷 | [JOSPT Plantar Heel Pain CPG, 2023](https://www.orthopt.org/uploads/content_files/files/Heel_Pain_Plantar_Fasciitis_Revision_2023.pdf) | 指引明確支持足底筋膜與腓腸／比目魚肌伸展 |
| 中段跟腱疼痛 | 依耐受度的跟腱負荷，從坐姿／雙腳漸進 | [JOSPT Midportion Achilles Tendinopathy CPG, 2024](https://www.orthopt.org/uploads/content_files/files/chimenti_et_al_2024_achilles_pain_stiffness_and_muscle_power_deficits_midportion_achilles_tendinopathy_revision_2024.pdf) | A 級建議以可耐受的高負荷為第一線；不適用疑似斷裂、急性或明顯衰弱者 |
| 中軸型脊椎關節炎 | 活動度、姿勢與胸廓擴張，搭配藥物控制 | ASAS-EULAR 中軸型脊椎關節炎治療建議（連結待補） | 運動是核心非藥物治療，但**不能取代**抗發炎藥物；介面要求先經風濕免疫科評估 |

標示「連結待補」者為本輪新增，指引名稱正確但未實際點開驗證網址，請於引用前自行查證。
其餘連結沿用 2026-08-10 那一輪已驗證的內容。

### 依既有原則延伸、證據等級較低

以下診斷沒有專屬的臺灣或國際 CPG，內容是由同類問題的原則延伸（肌腱病＝漸進負荷；關節退化＝活動度加肌力加有氧；
神經壓迫＝減壓姿勢加神經滑動；術後＝依主治醫師階段限制），使用時請以個別臨床判斷為準：

- 肩部：鈣化性肌腱炎、二頭肌長頭肌腱病、肩鎖關節、肩不穩、肩胛動作異常、旋轉肌撕裂保守期
- 肘腕手：內側肘痛、肘隧道、狹窄性腱鞘炎、板機指、拇指 CMC、手部 OA、TFCC、橈骨骨折固定後
- 脊椎：小面關節、薦髂關節、滑脫、骨鬆性壓迫性骨折、胸椎與上背痛
- 髖：FAI、內收肌拉傷、近端腿後肌腱病、深臀症候群、髖置換術後
- 膝：髕腱病、MCL、ACL 恢復期、鵝足、ITBS、膝置換術後
- 足踝：慢性踝不穩、跟腱附著點型、腓骨肌腱、脛後肌腱、MTSS、蹠骨痛、拇趾、踝 OA

其中三個特別標註的取捨：

1. **跟腱附著點型**與中段型分開，且明確禁止腳跟下沉超過水平的離心訓練——兩者的負荷處方不同，混用會加重症狀。
2. **骨鬆性壓迫性骨折**只在確認穩定期後開立，且動作庫排除所有前彎與扭轉負荷（`avoidFor` 機制）。
3. **術後診斷**（髖／膝置換、ACL）一律要求醫師勾選「已知主治醫師指定的限制」，處方內容不取代該限制。

## 動作圖像

121 個動作中有 70 個沿用既有線稿，51 個目前沒有圖像，病人端改以放大的步驟文字呈現。
清單與補圖優先順序見 [`exercise-art-todo.md`](exercise-art-todo.md)。刻意不讓相近但不同的動作共用圖，
避免圖文不符造成病人做錯動作。

## 隱私與連結

處方以短碼編在網址片段（`#rx=`），不含姓名、病歷號或任何個資，也不儲存於後端。
2026-08 起使用 v2 短碼；先前發出的 v1 與更早的 base64 連結仍可解碼（對照表已凍結於 `src/lib/prescription.ts`）。
