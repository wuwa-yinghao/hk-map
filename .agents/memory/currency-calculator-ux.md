---
name: Currency calculator UX
description: Durable product behavior for the multi-currency profit calculator.
---

The calculator is a personal, mobile-first utility. Currency switching must change the active calculation context without changing any other currency's saved values; the four initial currencies are protected from deletion, while custom currencies may be removed.

**Why:** The requested workflow is to calculate separate profits for several currencies without changing the original calculator's behavior.

**How to apply:** Keep currency management and calculator persistence client-side unless the user explicitly asks for accounts, sharing, or server-backed data.