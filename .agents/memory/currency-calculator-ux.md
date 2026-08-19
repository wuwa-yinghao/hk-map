---
name: Currency calculator UX
description: Durable product behavior for the multi-currency profit calculator.
---

The calculator is a personal, mobile-first utility. Currency switching must change the active calculation context without changing any other currency's saved values; every currency can be edited or removed except that the final remaining currency must be kept. Currency-facing labels should use Chinese names rather than ISO codes in the rail, manager rows, and profit summary. The floating rail exposes one settings action; adding and removing currencies belongs inside the manager opened by that action.

**Why:** The requested workflow is to calculate separate profits for several currencies without changing the original calculator's behavior.

**How to apply:** Keep currency management and calculator persistence client-side unless the user explicitly asks for accounts, sharing, or server-backed data. Keep the rail focused on switching and one settings entry point rather than putting destructive controls beside currency buttons.

Each formula uses independent upstream and downstream input amounts, while its outcomes and profit totals are always shown in USDT. Older saved entries that only have one shared amount must initialize both amounts from that value.

**Why:** Independent transactions require each side to retain the exact amount it used; silently treating old records as one-sided values would change previously saved calculations.

**How to apply:** Any future history import, export, or summary view must preserve and show both input amounts, using the legacy shared amount only as a compatibility fallback.