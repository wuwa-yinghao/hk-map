# 上下游差額幣種計算器

一個以手機為主的上下游成本／報價利潤計算器，可為每個幣種保留獨立的計算資料。

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/currency-profit-calculator/src/pages/CalculatorPage.tsx` — calculator page and edge-swipe currency experience
- `artifacts/currency-profit-calculator/src/hooks/use-calculator-state.ts` — per-currency calculator state and formulas
- `artifacts/currency-profit-calculator/src/hooks/use-currencies.ts` — default/custom currency list and local persistence
- `artifacts/currency-profit-calculator/src/components/calculator/` — calculator cards, currency rail, currency manager, gauges, and screenshot preview

## Architecture decisions

- Calculator data is stored locally per currency, so switching currencies never mixes profit calculations.
- The currency rail is intentionally client-side and edge-triggered; no account or server data is needed for this personal utility.
- The original calculator formulas and deposit/withdraw direction are preserved while the UI is implemented in React.

## Product

- Calculates real-time, upstream, downstream, and profit differences.
- Supports independent MYR, SGD, HKD, VND, and user-added currency workspaces.
- Provides mobile edge swipe switching, reset, quick adjustments, and screenshot sharing.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Currency names, currency list, active currency, and calculator values are persisted in browser localStorage.
- The screenshot action loads `html2canvas` from its CDN on demand.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
