# ARSIL BANK

واجهة ويب عربية لإدارة بنك نقاط، تتيح للمستخدم متابعة رصيده وحركاته وإشعاراته، وللمشرف إدارة أرصدة المستخدمين ومنح النقاط وتحويلها.

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

- `artifacts/arsil-bank/src/` — تطبيق الويب وواجهات المستخدم والمشرف.
- `artifacts/api-server/src/routes/arsil.ts` — عمليات الرصيد والنشاط والإشعارات ومنح/تحويل النقاط.
- `lib/api-spec/openapi.yaml` — المصدر الوحيد لعقد API.
- `lib/db/src/schema/arsil.ts` — جداول مستخدمي ARSIL والأنشطة والإشعارات.

## Architecture decisions

- التطبيق RTL بالعربية، مع تجربة مستخدم ومشرف ضمن نفس المنتج.
- كل عمليات الواجهة الأساسية تمر عبر API مولّد من OpenAPI لتبقى العقود متزامنة بين العميل والخادم.
- يتم تخزين نقاط ARSIL والأنشطة والإشعارات في PostgreSQL، مع بيانات تجريبية أولية لتوضيح تجربة المنتج.

## Product

- لوحة مستخدم تعرض الرصيد، الاتجاه الأسبوعي، الملخص الشهري، السجل، والإشعارات.
- لوحة مشرف تعرض إجمالي نقاط المجتمع وأعلى الأرصدة والنشاط الحي.
- إدارة المستخدمين مع البحث ومنح النقاط أو تحويلها، وتوليد إشعار للمستفيد.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- استخدم `pnpm --filter @workspace/api-spec run codegen` بعد أي تغيير على OpenAPI.
- واجهة ARSIL تستخدم `BASE_PATH` الذي يحقنه workflow؛ لا تضف مسارات جذرية بديلة داخل التطبيق.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
