# LearnHub

A subscription-based learning platform where YouTube creators sell premium courses, lessons, PDF notes, and downloadable resources to their audience via monthly/yearly Stripe subscriptions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/learn run dev` — run the frontend (dynamic port via $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + shadcn/ui + wouter
- Auth: Clerk (Replit-managed, keys auto-provisioned)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Payments: eSewa (Nepal's leading digital wallet — configurable via env vars)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth OpenAPI spec
- `lib/api-zod/src/generated/api.ts` — Zod schemas for server-side validation
- `lib/api-client-react/src/generated/api.ts` — React Query hooks for the frontend
- `lib/db/src/schema/` — Drizzle ORM schema files (users, courses, lessons, resources, subscriptions, progress, downloads)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/learn/src/pages/` — All frontend pages
- `artifacts/learn/src/components/` — Shared UI components
- `artifacts/learn/src/index.css` — Tailwind theme and CSS layer ordering

## Architecture decisions

- **Contract-first API**: OpenAPI spec is the single source of truth; Zod schemas and React Query hooks are generated from it. Never hand-write API types.
- **Clerk auth proxy**: Clerk requests are proxied through the Express API server (`/clerk` path) so the frontend never calls Clerk directly. Managed via `@clerk/express` and `clerkMiddleware`.
- **Raw body for Stripe webhooks**: The `/api/stripe/webhook` path uses raw body parsing via `express.raw()` before `express.json()` to allow Stripe signature verification.
- **Subscription middleware**: `requireActiveSubscription` middleware checks the `subscriptions` table for an active row for the current user — applied to premium-gated routes.
- **Role-based admin**: User `role` is stored in the DB `users` table, synced from Clerk. Admin routes are protected by `requireAdmin` middleware.

## Product

- **Public**: Landing page, course catalog (browse without auth), pricing page
- **Authenticated (any user)**: Dashboard with stats and continue-watching, course detail + lesson player (YouTube embeds), lesson progress tracking
- **Subscribers only**: Full access to all lessons, resource vault (PDF notes, source code downloads)
- **Admins**: Admin dashboard with user/subscription management, course/lesson CRUD

## User preferences

- React + Vite (not Next.js)
- eSewa integration: checkout sessions (HMAC-signed form POST), payment verification via eSewa status API
- Graceful 503 fallback when eSewa is not configured (defaults to test/sandbox mode)

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` before editing routes or frontend hooks.
- Do NOT run `pnpm dev` at workspace root — use workflow restarts or per-package commands.
- eSewa routes use `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, `ESEWA_MONTHLY_PRICE`, `ESEWA_YEARLY_PRICE`, `ESEWA_ENV` env vars. Defaults to eSewa sandbox (EPAYTEST) when not set — API returns 503 only if secret key is explicitly missing in production mode.
- Raw body parsing is NOT needed for eSewa (no webhook — verification is done by calling eSewa's status API directly).
- The Clerk `Show` component renders nothing while loading — use `useUser()` hooks with `isLoaded` checks for route guards to avoid blank pages.
- Seed data: 4 courses, 12 lessons, 6 resources are pre-seeded in the DB.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk integration details
