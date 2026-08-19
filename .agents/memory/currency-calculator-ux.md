---
name: Currency calculator UX
description: Durable product behavior for the multi-currency profit calculator.
---

The calculator is a personal, mobile-first utility. Currency switching must change the active calculation context without changing any other currency's saved values; every currency can be edited or removed except that the final remaining currency must be kept. Currency-facing labels should use Chinese names rather than ISO codes in the rail, manager rows, and profit summary. The floating rail exposes one settings action; adding and removing currencies belongs inside the manager opened by that action.

**Why:** The requested workflow is to calculate separate profits for several currencies without changing the original calculator's behavior.

**How to apply:** Keep currency management and calculator persistence client-side unless the user explicitly asks for accounts, sharing, or server-backed data. Keep the rail focused on switching and one settings entry point rather than putting destructive controls beside currency buttons.

Each formula uses one shared transaction amount plus separate fixed upstream and downstream fees in USDT. Each fee is added to its corresponding result before profit totals are calculated.

**Why:** Upstream and downstream costs may have different per-transaction fees, while the underlying transaction amount is the same. Applying either fee to both sides would distort profits.

**How to apply:** Any future history import, export, or summary view must preserve the shared amount and both fees, show the addition in its formula, and default missing fees in older records to zero.

Upstream and downstream fee inputs are low-frequency controls and start collapsed. Their compact rows must still indicate whether a fee is unset or show the active USDT amount.

**Why:** Most calculations do not need fee changes, so always-visible fee inputs add noise and vertical height to the mobile-first screen.

**How to apply:** Keep the two disclosures independent; opening one must not hide or change the other fee, and collapsing a section must never remove its fee from the calculation.