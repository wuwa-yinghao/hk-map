---
name: Flow summary specification
description: Upstream and downstream amount summaries share one modal layout and differ only in direction-specific labels, formula fields, icons, and colors.
---

上游統計、下游統計與各幣種利潤統計應維持一致的明細規格：總和區、幣種區塊、筆數、空狀態、時間格式、公式明細、備註與關閉方式都一致；只有方向文字、箭頭、點位／匯率欄位、結果色彩和計算結果不同。明細中「入金／出金」獨立成標籤行，每筆第一行顯示時間與該筆備註，第二行顯示公式；公式逐筆佔滿卡片寬度並自然換行，不使用水平捲動。Rail 的四個統計／設置入口採兩欄兩列。

**Why:** 三者本質上都是同一類的金額明細彙總，分開維護容易造成一邊有日期、空狀態或格式更新，另一邊沒有；把備註放在區塊底部會無法對應多筆記錄，手機上把方向標籤和公式擠在同一行也容易裁切公式，四個入口直排也會佔用過多 Rail 高度。

**How to apply:** 後續新增統計方向或調整彙總版型時，優先修改共用統計元件，再由方向設定提供語意差異。