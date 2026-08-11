# 臨床內容依據與使用邊界

更新日：2026-08-11

## 產品定位

本工具是「醫師評估後的運動處方傳遞工具」，不是病人自我診斷器。診斷、分期、警訊排除與是否適合居家運動，均由開立醫師決定。介面中的次數、組數與頻率是可調整的實作預設值，不代表臨床指引對所有病人的固定劑量。

## 診斷庫與運動方向

| 問題 | 本工具採用的核心方向 | 主要依據 | 證據／限制 |
|---|---|---|---|
| 頸部疼痛 | 頸部活動、頸肩控制、肩胛帶肌力／耐力 | [JOSPT Neck Pain CPG, 2017](https://pubmed.ncbi.nlm.nih.gov/28666405/) | 臨床指引；需依急慢性與分類調整 |
| 五十肩 | 依組織敏感度分期，從舒適活動至漸進伸展 | [APTA Adhesive Capsulitis CPG](https://orthopt.org/uploads/content_files/ICF/Updated_Guidelines/Shoulder_Pain__Mobility_Deficits_Adhesive_Capsulitis_Clinical_Practice_Guideline___2012_06_22_version.pdf) | 舊版指引；新版仍在修訂中，需醫師個別化 |
| 旋轉肌相關肩痛 | 主動復健、動作控制與漸進阻力 | [Rotator Cuff Tendinopathy CPG, 2025](https://pubmed.ncbi.nlm.nih.gov/40165544/) | 指引建議初始採主動復健；最佳劑量仍須個別化 |
| 外側肘痛 | 伸腕肌等長、向心／離心阻力與漸進負荷 | [JOSPT Lateral Elbow Pain CPG, 2022](https://www.orthopt.org/content/s/lateral-elbow-pain-and-muscle-function-impairments) | 指引支持等長、向心及／或離心阻力訓練 |
| 下背痛 | 一般活動、軀幹訓練；有明確方向偏好才選方向性動作 | [JOSPT Low Back Pain CPG, 2021](https://www.orthopt.org/content/s/interventions-for-the-management-of-acute-and-chronic-low-back-pain-revision-2021) | 介面另設方向確認與神經性跛行快篩，避免機械套用 |
| 髖關節退化 | 肌力、柔軟度、功能與有氧活動 | [JOSPT Hip OA CPG, 2025](https://www.orthopt.org/news/new-2025-hip-oa-clinical-practice-guideline-now-available) | 新版指引支持個別化肌力、柔軟度、耐力與功能訓練 |
| 外側髖痛 | 降低壓迫姿勢、漸進臀肌負荷與功能訓練 | [ISHA GTPS Consensus, 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC10234389/) | 共識文件，確定性低於正式 CPG；預設須由醫師覆核 |
| 膝關節退化 | 活動度、股四頭肌與漸進功能／有氧訓練 | [AAOS Knee OA CPG, 2021](https://www.aaos.org/quality/quality-programs/osteoarthritis-of-the-knee/) | 強烈建議監督、非監督或水中運動；本工具僅提供陸上簡化版本 |
| 髕股疼痛 | 髖外側與膝部共同訓練 | [JOSPT Patellofemoral Pain CPG, 2019](https://doi.org/10.2519/jospt.2019.0302) | 指引偏好髖與膝共同訓練；早期可較偏重髖部 |
| 踝扭傷恢復 | 漸進承重、活動度、肌力、本體感覺與平衡 | [JOSPT Lateral Ankle Sprain CPG, 2021](https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf) | 指引支持漸進承重；平衡／本體訓練可降低再扭傷風險 |
| 足底跟痛 | 足底筋膜特定伸展、小腿伸展與漸進負荷 | [JOSPT Plantar Heel Pain CPG, 2023](https://www.orthopt.org/uploads/content_files/files/Heel_Pain_Plantar_Fasciitis_Revision_2023.pdf) | 指引明確支持足底筋膜與腓腸／比目魚肌伸展 |
| 中段跟腱疼痛 | 依耐受度的跟腱負荷，從坐姿／雙腳漸進 | [JOSPT Midportion Achilles Tendinopathy CPG, 2024](https://www.orthopt.org/uploads/content_files/files/chimenti_et_al_2024_achilles_pain_stiffness_and_muscle_power_deficits_midportion_achilles_tendinopathy_revision_2024.pdf) | A 級建議以可耐受的高負荷為第一線；不適用疑似斷裂、急性或明顯衰弱者 |

## 安全設計

- 安全篩檢為產生 QR 的必要條件；選擇「有警訊」會阻擋處方。
- 腰痛方向性動作須額外確認症狀集中化；疑似神經性跛行時停用伸展方向預設。
- 跟腱處方須額外確認為跟骨上方約 2–6 公分的中段腱體疼痛；附著點型、部分撕裂或急性斷裂疑慮不得產生 QR。
- 診斷卡提供部位特異的警訊提示，但不能取代完整病史、理學檢查、Ottawa ankle rules 或其他正式決策工具。
- 所有病人版均顯示停止規則、緊急警訊與逾 14 天重新評估提醒。
- 處方連結不含姓名、病歷號或其他個資。
- 首次成功開啟後，固定名稱的主程式／樣式與全部動作圖會由 service worker 預載；2026-08-11 已以關閉伺服器後的一般瀏覽器重新整理驗證離線可再次查看。首次掃碼仍需要網路，因此義診建議同步列印紙本＋QR。

## 仍需醫師判斷的部分

1. 每次次數、組數、頻率、疼痛容許值與進階條件。
2. 急性外傷、術後、骨折、感染、腫瘤、神經病變、嚴重衰弱與高跌倒風險病人的適用性。
3. 「外側髖痛」的預設來自共識與負荷管理原則，證據確定性較低。
4. 「跟腱疼痛」目前限中段跟腱病變；附著點型、部分撕裂或急性斷裂不應直接套用。
5. 次數型動作不顯示通用計時器；分鐘型活動才依醫師設定的分鐘數倒數，避免病人誤以為所有動作都要連續做 60 秒。
