---
name: Flow summary specification
description: Upstream and downstream amount summaries share one modal layout and differ only in direction-specific labels, formula fields, icons, and colors.
---

上游統計與下游統計應維持完全相同的 UI 規格：總和區、幣種區塊、筆數、空狀態、時間格式、公式明細、備註與關閉方式都一致；只有方向文字、箭頭、點位／匯率欄位、結果色彩和計算結果不同。

**Why:** 兩者本質上都是同一類的金額彙總，分開維護容易造成一邊有日期、空狀態或格式更新，另一邊沒有。

**How to apply:** 後續新增統計方向或調整彙總版型時，優先修改共用統計元件，再由方向設定提供語意差異。