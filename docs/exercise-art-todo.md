# 待補動作圖像

更新日：2026-08-11

動作庫共 121 個動作，其中 70 個沿用既有線稿，**51 個目前沒有圖像**。

沒有相符線稿時，`Exercise.image` 一律留空，病人端與紙本改以放大的步驟文字呈現。
這是刻意的取捨：圖文不符會讓病人做錯動作，比沒有圖更危險。既有線稿只在確實畫得出該動作時才沿用
（例如 `neck-control.png`、`calf-loading.png` 這類三聯示意，本來就設計為同一動作家族共用）。

補圖時只需在 `src/data/exercises.ts` 對應項目加上 `image: '/exercises/<檔名>.png'`，
並把檔名加進 `public/sw.js` 的 `APP_SHELL`（同時把 `CACHE_NAME` 往上加一版），離線才會一起快取。

## 頸部與顳顎（8）

- `upper-trap-stretch` 上斜方肌伸展
- `levator-stretch` 提肩胛肌伸展
- `suboccipital-release` 枕下肌放鬆
- `cervical-nerve-glide` 上肢神經滑動
- `jaw-opening-control` 下顎開合控制
- `jaw-isometric` 下顎等長收縮
- `diaphragm-breathing` 橫膈呼吸
- `brachial-plexus-slider` 胸廓出口神經滑動

## 肩部（7）

- `band-external-rotation` 彈力帶肩外轉
- `band-row` 彈力帶划船
- `scaption-raise` 斜前平面抬手
- `wall-push-plus` 牆面推撐加壓
- `prone-y-raise` 俯臥 Y 字抬手
- `sleeper-stretch` 側躺肩內轉伸展
- `shoulder-shrug-control` 聳肩下放控制

## 肘腕手（9）

- `grip-squeeze` 握力訓練
- `forearm-rotation` 前臂旋轉活動
- `median-nerve-glide` 正中神經滑動
- `ulnar-nerve-glide` 尺神經滑動
- `tendon-gliding` 手指肌腱滑動
- `finger-rom` 手指關節活動
- `thumb-cmc-isometric` 拇指等長收縮
- `thumb-abduction` 拇指外展訓練
- `elbow-rom` 手肘主動活動

## 胸腰背與軀幹（12）

- `cat-camel` 貓牛式
- `bird-dog` 鳥狗式
- `side-plank-knee` 屈膝側棒式
- `sciatic-nerve-glide` 坐骨神經滑動
- `flexion-in-sitting` 坐姿前彎
- `hip-hinge` 髖絞鏈練習
- `thoracic-extension-chair` 坐姿胸椎伸展
- `thoracic-rotation` 側躺開書式旋轉
- `wall-posture-drill` 靠牆姿勢練習
- `chest-expansion` 胸廓擴張運動
- `prone-back-extension` 俯臥背部伸肌訓練
- `stationary-cycling` 固定式腳踏車

## 髖與骨盆（6）

- `hip-flexor-stretch` 髖屈肌伸展
- `hip-extension-standing` 站姿髖後伸
- `adductor-progression` 內收肌漸進訓練
- `hamstring-isometric` 腿後肌等長收縮
- `hip-hinge-load` 負重髖絞鏈
- `standing-hip-flexion` 站姿抬膝

## 膝（4）

- `wall-sit-isometric` 靠牆靜蹲
- `mini-squat` 扶穩迷你蹲
- `hamstring-stretch` 腿後肌伸展
- `quad-stretch` 大腿前側伸展

## 足踝小腿（5）

- `ankle-eversion-band` 彈力帶踝外翻
- `ankle-inversion-band` 彈力帶踝內翻
- `short-foot` 足弓短縮訓練
- `towel-curl` 毛巾抓握
- `toe-spread` 腳趾張開控制

## 建議優先順序

1. **神經滑動類**（正中、尺、坐骨、上肢張力）——步驟最抽象，最需要圖示。
2. **彈力帶阻力類**（肩外轉、划船、踝內外翻）——器材擺位講不清楚容易做錯方向。
3. **四足與側躺類**（鳥狗、貓牛、側棒、開書旋轉）——起始姿勢用文字描述最冗長。
4. 其餘伸展與等長動作。
