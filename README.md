# KC Class BHW — LearnHub

A subscription-based B.Ed English learning platform where KC Class BHW sells premium courses, lessons, PDF notes, and downloadable resources to students via monthly and yearly eSewa subscriptions.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [eSewa Payment Setup](#esewa-payment-setup)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [User Roles & Access Control](#user-roles--access-control)
10. [Frontend Pages](#frontend-pages)
11. [How to Add Content (Creator Guide)](#how-to-add-content-creator-guide)
12. [YouTube Auto-Sync](#youtube-auto-sync)
13. [Architecture Decisions](#architecture-decisions)
14. [Development Workflow](#development-workflow)
15. [Deployment & Production Checklist](#deployment--production-checklist)
16. [Common Gotchas](#common-gotchas)

---

## Overview

LearnHub is the online academy for KC Class BHW. Students browse free course previews, then pay a monthly or yearly subscription via eSewa (Nepal's leading digital wallet) to unlock all lessons, PDF notes, grammar charts, and downloadable resources. Lesson videos are embedded from YouTube — no separate video hosting needed.

**What the platform does:**

- Students can browse the full course catalog without signing in
- Free "preview" lessons are watchable without a subscription
- Students subscribe via eSewa (monthly NPR 299 or yearly NPR 2,399)
- After payment, all premium lessons and the resource vault unlock
- Lesson progress (completed/not completed) is tracked per student
- Admin dashboard lets the creator manage courses, lessons, resources, users, and subscriptions
- The Videos page automatically shows the latest YouTube uploads — no manual update needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22+, TypeScript 5.9 |
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, wouter |
| Backend | Express 5 |
| Database | PostgreSQL, Drizzle ORM |
| Auth | Clerk (Replit-managed, keys auto-provisioned) |
| Payments | eSewa (HMAC-signed form POST + status API verification) |
| Validation | Zod v4, drizzle-zod |
| API codegen | Orval (OpenAPI → React Query hooks + Zod schemas) |
| Monorepo | pnpm workspaces |
| Build | esbuild (API server), Vite (frontend) |

---

## Project Structure

```
learnhub/
├── artifacts/
│   ├── learn/                        # React frontend (Vite)
│   │   └── src/
│   │       ├── pages/                # All page components
│   │       │   ├── home.tsx          # Landing page
│   │       │   ├── courses.tsx       # Course catalog
│   │       │   ├── course-detail.tsx # Single course + lesson list
│   │       │   ├── lesson.tsx        # Lesson video player
│   │       │   ├── videos.tsx        # YouTube channel auto-sync
│   │       │   ├── pricing.tsx       # eSewa subscription plans
│   │       │   ├── payment-verify.tsx# Post-payment verification
│   │       │   ├── dashboard.tsx     # Student dashboard
│   │       │   ├── resources.tsx     # Resource vault (subscriber only)
│   │       │   ├── settings.tsx      # Profile + subscription management
│   │       │   ├── not-found.tsx     # 404 page
│   │       │   ├── admin.tsx         # Admin overview
│   │       │   ├── admin-courses.tsx # Course CRUD
│   │       │   └── admin-lessons.tsx # Lesson CRUD per course
│   │       ├── components/           # Shared UI components
│   │       │   ├── admin-layout.tsx  # Admin sidebar layout
│   │       │   ├── navbar.tsx        # Top navigation
│   │       │   └── ui/               # shadcn/ui primitives
│   │       └── index.css             # Tailwind theme + CSS layers
│   └── api-server/                   # Express API server
│       └── src/
│           ├── routes/
│           │   ├── auth.ts           # requireAuth / requireAdmin middleware
│           │   ├── courses.ts        # Course CRUD routes
│           │   ├── lessons.ts        # Lesson CRUD + subscription gate
│           │   ├── resources.ts      # Resource vault routes
│           │   ├── subscriptions.ts  # eSewa checkout + verify + autoExpire
│           │   ├── progress.ts       # Lesson completion tracking
│           │   ├── dashboard.ts      # Dashboard summary routes
│           │   ├── users.ts          # User profile routes
│           │   ├── admin.ts          # Admin stats + user management
│           │   └── videos.ts         # YouTube RSS feed sync
│           ├── middlewares/          # Clerk proxy middleware
│           ├── lib/
│           │   └── logger.ts         # Pino logger singleton
│           └── app.ts                # Express app setup + global error handler
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml              # Source-of-truth OpenAPI spec
│   ├── api-zod/
│   │   └── src/generated/api.ts      # Zod schemas (auto-generated — do not edit)
│   ├── api-client-react/
│   │   └── src/generated/api.ts      # React Query hooks (auto-generated — do not edit)
│   └── db/
│       └── src/schema/
│           ├── users.ts
│           ├── courses.ts
│           ├── lessons.ts
│           ├── resources.ts
│           ├── subscriptions.ts
│           ├── progress.ts
│           └── downloads.ts
└── scripts/                          # Utility scripts
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- A PostgreSQL database (`DATABASE_URL` secret)
- Clerk auth (auto-provisioned on Replit — nothing to configure)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 3. Start both services

On Replit both services start automatically as workflows. To start them manually:

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (dynamic port via $PORT)
pnpm --filter @workspace/learn run dev
```

> **Important:** Never run `pnpm dev` or `pnpm run dev` at the workspace root — there is no root dev script by design.

---

## Environment Variables

Set these in the **Secrets** tab of your Replit project. Never put secrets in code.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `ESEWA_PRODUCT_CODE` | For live payments | `EPAYTEST` | Your eSewa merchant code |
| `ESEWA_SECRET_KEY` | For live payments | Sandbox key | Your eSewa HMAC secret key |
| `ESEWA_MONTHLY_PRICE` | Optional | `299` | Monthly price in NPR |
| `ESEWA_YEARLY_PRICE` | Optional | `2399` | Yearly price in NPR |
| `ESEWA_ENV` | For live payments | _(empty = sandbox)_ | Set to `production` for live eSewa |
| `CLERK_PUBLISHABLE_KEY` | Auto-set | — | Automatically provided by Replit |
| `CLERK_SECRET_KEY` | Auto-set | — | Automatically provided by Replit |

**Sandbox mode (default):** If `ESEWA_ENV` is not set to `production`, the app uses eSewa's test merchant automatically. You can test payments end-to-end without any eSewa account. The API only returns `503` if `ESEWA_SECRET_KEY` is explicitly missing in production mode.

---

## eSewa Payment Setup

### What is eSewa?

[eSewa](https://esewa.com.np/) is Nepal's most popular digital wallet. It is used instead of Stripe or PayPal because it supports NPR and is the payment method students in Nepal already use.

### Sandbox / development testing (no setup needed)

The app runs in eSewa sandbox mode by default using the test merchant code `EPAYTEST`. To complete a test payment end-to-end:

1. Go to `/pricing` and click **Pay Monthly** or **Pay Yearly**
2. You are redirected to eSewa's test gateway at `rc-epay.esewa.com.np`
3. Log in with any of these test credentials:
   - eSewa IDs: `9806800001` through `9806800005`
   - MPIN: `1122`
   - Password: `Nepal@123`
4. Complete the payment — you are redirected back to `/payment/verify`
5. Your subscription activates and you are sent to `/dashboard`

### Going live (production)

#### Step 1 — Get a merchant account

Apply at [esewa.com.np/epay/merchant](https://esewa.com.np/epay/merchant). You will receive a **merchant code** and a **secret key**.

#### Step 2 — Add secrets to Replit

In your project, open the **Secrets** tab and add:

```
ESEWA_PRODUCT_CODE  = YOUR_MERCHANT_CODE
ESEWA_SECRET_KEY    = YOUR_SECRET_KEY
ESEWA_MONTHLY_PRICE = 299
ESEWA_YEARLY_PRICE  = 2399
ESEWA_ENV           = production
```

#### Step 3 — Publish the app

Click **Publish** in Replit. eSewa will redirect students back to your live `.replit.app` domain after payment.

### How the payment flow works

```
Student clicks "Pay with eSewa" on /pricing
        ↓
POST /api/subscriptions/checkout  { plan: "monthly" | "yearly" }
        ↓
Server generates HMAC-signed payment data (amount, product code, UUID)
        ↓
Frontend auto-submits a hidden form POST to eSewa's payment page
        ↓
Student logs into eSewa and confirms the payment
        ↓
eSewa redirects to /payment/verify?plan=monthly&data=<base64-encoded-result>
        ↓
Frontend sends the encoded data to POST /api/subscriptions/verify
        ↓
Server calls eSewa's status API to independently confirm the transaction
        ↓
Server creates or updates the subscription row (status = active)
        ↓
Student is redirected to /dashboard with full access unlocked
```

### No webhooks needed

eSewa uses a redirect-based flow — the transaction result is encoded in the redirect URL. The server verifies it by calling eSewa's status API directly. No webhook endpoint or secret signing required.

### Subscription lifecycle

eSewa does not support automatic recurring billing. Each subscription is a one-time payment that lasts 1 month or 1 year. When the period ends, students renew manually from the pricing page.

| Event | What happens |
|---|---|
| Successful eSewa payment + server verification | Subscription row created/updated, `status = active`, `currentPeriodEnd` set |
| Student visits any page after `currentPeriodEnd` | Server auto-sets `status = inactive` on the next `/api/subscriptions/me` call |
| Student renews (pays again) | `currentPeriodEnd` extended by 1 month or 1 year from today |

---

## Database Schema

All tables live in `lib/db/src/schema/`. The database is managed with Drizzle ORM + PostgreSQL.

### `users`

Synced from Clerk on first login.

| Column | Type | Notes |
|---|---|---|
| `clerk_id` | text (PK) | Clerk user ID |
| `email` | text | User's email |
| `name` | text | Display name |
| `bio` | text | Optional bio |
| `avatar_url` | text | Profile picture URL |
| `role` | text | `user` or `admin` |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Auto-updated |

### `courses`

| Column | Type | Notes |
|---|---|---|
| `id` | serial (PK) | — |
| `title` | text | Course title |
| `slug` | text (unique) | URL-friendly identifier |
| `description` | text | Course description |
| `thumbnail_url` | text | Cover image URL |
| `category` | text | e.g. Grammar, Pedagogy, Phonetics |
| `is_free` | boolean | Whether the whole course is free |
| `is_published` | boolean | Only published courses appear in catalog |
| `total_duration_minutes` | integer | Optional total length |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Auto-updated |

### `lessons`

| Column | Type | Notes |
|---|---|---|
| `id` | serial (PK) | — |
| `course_id` | integer | Parent course |
| `title` | text | Lesson title |
| `description` | text | Notes / summary shown below the video |
| `youtube_video_id` | text | YouTube video ID (e.g. `dQw4w9WgXcQ`) |
| `video_url` | text | Direct `.mp4` URL (alternative to YouTube) |
| `duration_minutes` | integer | Length shown in the lesson list |
| `order` | integer | Sort position within the course |
| `is_free` | boolean | Free preview — watchable without subscription |
| `is_published` | boolean | Only published lessons appear |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Auto-updated |

### `resources`

| Column | Type | Notes |
|---|---|---|
| `id` | serial (PK) | — |
| `title` | text | Resource name |
| `description` | text | Optional description |
| `category` | text | e.g. PDF Notes, Grammar Chart, Source Code |
| `file_type` | text | `pdf`, `zip`, `code`, or `video` |
| `file_size` | integer | File size in bytes |
| `storage_key` | text | Key used to generate the signed download URL |
| `download_count` | integer | Total downloads tracked |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Auto-updated |

### `subscriptions`

| Column | Type | Notes |
|---|---|---|
| `id` | serial (PK) | — |
| `user_id` | text | Clerk user ID |
| `esewa_transaction_id` | text | eSewa transaction UUID |
| `status` | text | `active`, `inactive`, `canceled`, `past_due` |
| `plan` | text | `none`, `monthly`, or `yearly` |
| `current_period_end` | timestamptz | When this subscription expires |
| `cancel_at_period_end` | boolean | Reserved for future use |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Auto-updated |

### `progress`

| Column | Type | Notes |
|---|---|---|
| `id` | serial (PK) | — |
| `user_id` | text | Clerk user ID |
| `lesson_id` | integer | — |
| `course_id` | integer | Denormalized for faster dashboard queries |
| `completed` | boolean | Whether the student marked this done |
| `last_accessed_at` | timestamptz | Used for "continue watching" |

### `downloads`

| Column | Type | Notes |
|---|---|---|
| `id` | serial (PK) | — |
| `user_id` | text | Clerk user ID |
| `resource_id` | integer | Which resource was downloaded |
| `downloaded_at` | timestamptz | Timestamp of the download |

### Push schema changes to the database

```bash
pnpm --filter @workspace/db run push
```

> Use this in development only. For production, apply schema changes carefully — `push` is destructive on column drops.

### Seed data

The database comes pre-seeded with:
- 4 courses (Grammar, Pedagogy, Phonetics, Literature)
- 12 lessons across those courses
- 6 downloadable resources

---

## API Reference

All endpoints are prefixed with `/api`. The full OpenAPI spec lives at `lib/api-spec/openapi.yaml`.

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/healthz` | Public | Returns `{ status: "ok" }` |

### Videos (YouTube auto-sync)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/videos` | Public | Latest videos from the YouTube channel (cached 10 min) |

### Courses

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/courses` | Public | List published courses. Supports `?search=` and `?category=` |
| `GET` | `/courses/:id` | Public | Get a single course with its lesson list |
| `POST` | `/courses` | Admin | Create a new course |
| `PATCH` | `/courses/:id` | Admin | Update a course (title, description, thumbnail, category, published status) |
| `DELETE` | `/courses/:id` | Admin | Delete a course |

### Lessons

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/courses/:courseId/lessons` | Public | List published lessons for a course |
| `GET` | `/courses/:courseId/lessons/:id` | Auth (subscription for premium) | Get a single lesson. Free lessons are open; premium requires active subscription |
| `POST` | `/courses/:courseId/lessons` | Admin | Add a lesson to a course |
| `PATCH` | `/courses/:courseId/lessons/:id` | Admin | Update a lesson |
| `DELETE` | `/courses/:courseId/lessons/:id` | Admin | Delete a lesson |

### Resources (Subscriber-only)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/resources` | Subscriber | List all downloadable resources |
| `GET` | `/resources/:id` | Subscriber | Get a resource with its signed download URL |
| `POST` | `/resources/:id/download` | Subscriber | Log a download event |
| `POST` | `/resources` | Admin | Add a resource |
| `PATCH` | `/resources/:id` | Admin | Update a resource |
| `DELETE` | `/resources/:id` | Admin | Delete a resource |

### Subscriptions & eSewa Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/subscriptions/me` | Auth | Get the current student's subscription status and plan. Also auto-expires inactive subscriptions |
| `POST` | `/subscriptions/checkout` | Auth | Generate HMAC-signed eSewa payment form data. Body: `{ plan: "monthly" \| "yearly" }` |
| `POST` | `/subscriptions/verify` | Auth | Verify eSewa payment and activate subscription. Body: `{ encodedData: "...", plan: "monthly" \| "yearly" }` |

### Progress

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/progress` | Auth | Get the current student's completion status across all lessons |
| `POST` | `/progress/:lessonId` | Auth | Mark a lesson complete or incomplete. Body: `{ completed: true \| false }` |

### Dashboard

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Auth | Stats card data: enrolled courses, completed lessons, subscription status |
| `GET` | `/dashboard/continue-watching` | Auth | Recently accessed lessons (up to 5) |
| `GET` | `/dashboard/download-history` | Auth | List of all resources the student has downloaded |

### User Profile

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | Auth | Get own profile with subscription info |
| `PATCH` | `/users/me` | Auth | Update own name and bio |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin | Total users, active subscribers, total courses, monthly revenue (NPR) |
| `GET` | `/admin/users` | Admin | All users with their subscription status |
| `GET` | `/admin/subscriptions` | Admin | All subscriptions with subscriber name and email |
| `PATCH` | `/admin/users/:clerkId/role` | Admin | Change a user's role to `admin` or `user` |

---

## User Roles & Access Control

| Level | Who | Can do |
|---|---|---|
| **Public** | Anyone (not signed in) | Browse course catalog, view course details, view pricing page, watch the Videos page |
| **Authenticated** | Signed-in users (no subscription) | Everything above + dashboard, free/preview lessons, progress tracking |
| **Subscriber** | Users with an active eSewa subscription | Everything above + all premium lessons, resource vault, file downloads |
| **Admin** | Users with `role = admin` in the database | Everything above + admin dashboard, full CRUD on courses/lessons/resources, user and subscription management |

### How to make yourself an admin

**Option 1 — SQL (fastest):**

```sql
UPDATE users SET role = 'admin' WHERE clerk_id = 'user_YOUR_CLERK_ID_HERE';
```

Find your Clerk ID by signing into the app, then checking the Clerk dashboard or looking at the network tab for any `/api/users/me` response.

**Option 2 — Another admin does it via UI:**

Go to `/admin` → Users tab → find the user → change their role to Admin.

---

## Frontend Pages

| Route | Access | What it shows |
|---|---|---|
| `/` | Public | Landing page. Hero, features, testimonials, footer. Redirects to `/dashboard` if already signed in |
| `/courses` | Public | Full course catalog with search and category filter |
| `/courses/:id` | Public | Course detail: description, lesson list, instructor info |
| `/courses/:courseId/lessons/:id` | Auth (subscription for premium) | Lesson video player (YouTube embed), lesson notes, progress toggle |
| `/videos` | Public | Latest YouTube channel videos — auto-syncs every 10 minutes |
| `/pricing` | Public | Monthly (NPR 299) and yearly (NPR 2,399) plans with eSewa checkout |
| `/payment/verify` | Auth | Post-payment landing page that verifies the eSewa transaction |
| `/sign-in` | Public | Clerk sign-in page |
| `/sign-up` | Public | Clerk sign-up page |
| `/dashboard` | Auth | Personalized dashboard: stats, continue watching, progress bars |
| `/resources` | Subscriber | Resource vault: PDF notes, grammar charts, downloadable files |
| `/settings` | Auth | Profile settings, subscription status, download history |
| `/admin` | Admin | Platform stats, user management, subscription management |
| `/admin/courses` | Admin | Create, edit, delete, publish/unpublish courses |
| `/admin/courses/:id/lessons` | Admin | Add, edit, delete, reorder lessons within a course |

---

## How to Add Content (Creator Guide)

### Adding a new course

1. Go to `/admin/courses`
2. Click **New Course**
3. Fill in:
   - **Title** — e.g. "Advanced Grammar"
   - **Description** — what students will learn
   - **Category** — e.g. Grammar, Pedagogy, Phonetics, Literature
   - **Thumbnail URL** — paste a direct image URL (or a YouTube thumbnail URL)
   - **Free Course** — toggle on if every lesson is free
   - **Published** — toggle on to make it visible in the catalog
4. Click **Create Course**

### Adding lessons to a course

1. Go to `/admin/courses` and click **Manage Lessons** on the course
2. Click **Add Lesson**
3. Fill in:
   - **Title** — lesson name shown in the list
   - **Description / Notes** — text shown below the video player to students
   - **YouTube Video ID** — the ID from your YouTube video URL (see below)
   - **Direct Video URL** — only use this if you're hosting the video yourself (not needed for YouTube)
   - **Duration (minutes)** — shown in the lesson list
   - **Sort Order** — controls the order lessons appear (1 = first)
   - **Free Preview** — toggle on to let unsubscribed students watch this lesson
   - **Published** — toggle on to make it visible
4. Click **Create Lesson**

#### How to find your YouTube Video ID

Your video URL looks like: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

The video ID is everything after `?v=` — in this example: `dQw4w9WgXcQ`

For unlisted videos (recommended for premium content): upload to YouTube, set visibility to **Unlisted**, copy the video ID. Students can only find it through your website — it won't appear in search results or your public channel page.

### Adding resources (PDF notes, downloads)

1. Go to `/admin` → Resources tab (or add via API)
2. Fill in the title, category, file type, and storage key
3. The storage key is the file path used to generate the signed download URL

> Note: Object/file storage for actual file hosting is a future feature. The `storageKey` field is ready — you can connect it to any file storage provider (e.g. AWS S3, Cloudflare R2) when ready.

---

## YouTube Auto-Sync

The `/videos` page automatically shows your latest YouTube uploads. No manual action is needed.

**How it works:**
- The server reads YouTube's public RSS feed for your channel every 10 minutes
- New videos appear on the site within 10 minutes of being published to YouTube
- No YouTube API key is required — it uses the free public RSS feed
- The channel ID is currently set to `UC77kf2jXTQvRl2vV3CI8oRA`

**To update the channel ID** (if it ever changes):

Edit line 5 in `artifacts/api-server/src/routes/videos.ts`:

```ts
const CHANNEL_ID = "YOUR_CHANNEL_ID_HERE";
```

To find your channel ID: go to your YouTube channel page → right-click → View Page Source → search for `"channelId"`.

---

## Architecture Decisions

### Contract-first API

`lib/api-spec/openapi.yaml` is the single source of truth for all API shapes. Both the server-side Zod validation schemas and the frontend React Query hooks are auto-generated from it. Never hand-write API types.

After editing `openapi.yaml`, always regenerate before touching routes or frontend:

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Clerk auth proxy

All Clerk requests are proxied through the Express API server at the `/clerk` path so the frontend never calls Clerk's CDN directly. Managed via `@clerk/express` and `clerkMiddleware`.

### eSewa instead of Stripe

eSewa is used because it supports NPR and is the payment method students in Nepal already have installed. The payment flow uses a form POST (HMAC-signed) rather than a redirect URL so that payment amounts cannot be tampered with client-side.

### Subscription gate middleware

The `requireActiveSubscription` middleware in `routes/auth.ts` checks the `subscriptions` table for a row with `status = active` matching the current Clerk user ID. It is applied to all premium-gated routes (lesson detail for non-free lessons, resource vault).

### Auto-expire on read

When a student calls `GET /api/subscriptions/me`, the server checks if `currentPeriodEnd` has passed. If it has, it updates `status` to `inactive` in the same request. This avoids needing a background cron job.

### Role-based admin

User role is stored in the `users` table. Admin routes are protected by `requireAdmin` middleware that reads the role from the DB — Clerk JWT alone is not enough.

### Global error handler

`app.ts` includes an Express error handler as the last middleware. Any unhandled error from a route (database failure, unexpected crash) returns a clean `{ error: "Internal server error" }` JSON response with status `500` rather than crashing the server or leaking stack traces.

### Logging

Never use `console.log` in server code. Use `req.log` inside route handlers and the `logger` singleton from `src/lib/logger.ts` for non-request code. Logs are structured JSON via Pino.

---

## Development Workflow

### Run the full type check

```bash
pnpm run typecheck
```

### Regenerate API code after editing openapi.yaml

```bash
pnpm --filter @workspace/api-spec run codegen
```

Always run this before editing route handlers or frontend hooks after any `openapi.yaml` change.

### Push database schema changes

```bash
pnpm --filter @workspace/db run push
```

### Adding a new API endpoint (step by step)

1. Add the path, parameters, request body, and response schema to `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Write the route handler in `artifacts/api-server/src/routes/`
4. Register it in `artifacts/api-server/src/routes/index.ts`
5. Use the generated React Query hook in the frontend component

### Build check (without running the server)

```bash
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/learn run typecheck
```

---

## Deployment & Production Checklist

### How deployment works

The app is two services behind a shared reverse proxy:

| Service | Path | Port |
|---|---|---|
| Frontend (Vite/React) | `/` | `$PORT` (auto-assigned) |
| API Server (Express) | `/api` | `8080` |

To deploy: click **Publish** in the Replit workspace. Both services are built and started automatically. The app is served over HTTPS on your `.replit.app` domain.

### Before publishing to production, verify:

- [ ] `DATABASE_URL` is set and points to your production database
- [ ] Database schema has been pushed: `pnpm --filter @workspace/db run push`
- [ ] eSewa live credentials are set: `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`
- [ ] `ESEWA_ENV=production` is set
- [ ] Prices are correct: `ESEWA_MONTHLY_PRICE=299`, `ESEWA_YEARLY_PRICE=2399`
- [ ] At least one user has been promoted to `admin` in the database
- [ ] `NODE_ENV=production` is set (Replit sets this automatically on publish)
- [ ] You have tested a full payment in sandbox mode before switching to production
- [ ] The YouTube channel ID in `videos.ts` is correct

---

## Common Gotchas

- **Do not run `pnpm dev` at the workspace root.** There is no root dev script. Always use `pnpm --filter @workspace/<name> run dev` or let Replit manage workflows.
- **Always run codegen after changing `openapi.yaml`.** The generated files in `lib/api-zod` and `lib/api-client-react` are what the server and frontend actually use. Skipping codegen means your changes won't take effect.
- **eSewa sandbox test credentials only work on eSewa's test gateway** (`rc-epay.esewa.com.np`). When `ESEWA_ENV=production`, real eSewa accounts are used.
- **Unlisted YouTube videos are best for premium lessons.** They are not searchable or visible on your channel page, so only students who find the link through your website can watch them.
- **The Clerk `<SignedIn>` component renders nothing while loading.** Use `useUser()` hooks with `isLoaded` checks in route guards to avoid brief blank pages.
- **`pnpm --filter @workspace/db run push` is for development only.** In production, dropping or renaming columns will destroy data. Apply schema changes carefully.
- **Subscription auto-expire runs on the next API call, not a timer.** If a student's subscription expires but they don't open the app, the DB row stays `active` until their next visit. This is intentional and safe — the middleware re-checks expiry on every premium route access.
#   k c - c l a s s - b h w  
 #   k c - c l a s s - b h w  
 