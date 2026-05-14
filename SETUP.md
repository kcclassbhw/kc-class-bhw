# KC Class BHW — Complete Local Setup Guide

Everything you need to go from zero to a fully running local development environment in VSCode.

---

## What You'll Have at the End

- The full website running at **http://localhost:3000**
- The API server running at **http://localhost:8080**
- Admin access to manage courses, lessons and resources
- Sample data already in the database
- Hot reload — changes to frontend code reflect instantly
- VSCode fully configured (IntelliSense, Tailwind hints, formatting)

---

## Prerequisites — Install These First

### 1. Node.js 22 or newer

Download from https://nodejs.org — choose the **LTS** version.

Verify: `node --version` → should show `v22.x.x` or higher

### 2. pnpm

```bash
npm install -g pnpm
```

Verify: `pnpm --version` → should show `9.x.x` or higher (10.x, 11.x all work)

### 3. Git

Download from https://git-scm.com/downloads

### 4. PostgreSQL — Pick One Option

**Option A — Local PostgreSQL (best performance)**

Download from https://www.postgresql.org/download/ and install.

**Option B — Neon (free cloud, no install needed)**

1. Go to https://neon.tech → Sign Up (free)
2. Create a project → name it `learnhub`
3. Copy the connection string from the dashboard — it looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 1 — Get the Code

### From Replit (download)
1. In your Replit project, click the three-dot menu (⋮) → **Download as zip**
2. Unzip it somewhere on your computer (e.g. `~/projects/kc-class-bhw`)
3. Open VSCode → **File → Open Folder** → select the unzipped folder

### From GitHub (if you pushed it there)
```bash
git clone https://github.com/YOUR_USERNAME/kc-class-bhw.git
cd kc-class-bhw
code .
```

---

## Step 2 — Install Dependencies

Open a terminal in VSCode (`Ctrl+`` ` `` ` on Windows/Linux, `Cmd+`` ` `` ` on Mac) and run:

```bash
pnpm install
```

This installs everything for all packages at once. Takes 1–3 minutes the first time.

---

## Step 3 — Get Your Clerk Keys

Your Clerk auth keys live in Replit's Secrets. You need to copy them out.

1. Open your Replit project in the browser
2. Click the **lock icon** (Secrets) in the left sidebar
3. Find and copy these two values:
   - `CLERK_PUBLISHABLE_KEY` — starts with `pk_test_...`
   - `CLERK_SECRET_KEY` — starts with `sk_test_...`

---

## Step 4 — Create Your Environment Files

You need to create two `.env` files. Do this in the VSCode terminal:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/learn/.env.example       artifacts/learn/.env
```

> **Windows users:** `cp` doesn't work in PowerShell or CMD. Use `copy` instead:
> ```
> copy artifacts\api-server\.env.example artifacts\api-server\.env
> copy artifacts\learn\.env.example       artifacts\learn\.env
> ```
> Or just copy the files manually in File Explorer and rename them from `.env.example` to `.env`.

Then open each file and fill in the values:

### `artifacts/api-server/.env`

```env
PORT=8080
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/learnhub
CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE
NODE_ENV=development
```

> If using Neon, replace the DATABASE_URL with your Neon connection string.

### `artifacts/learn/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
VITE_API_URL=http://localhost:8080
VITE_CLERK_PROXY_URL=http://localhost:8080/api/__clerk
PORT=3000
BASE_PATH=/
```

> The `VITE_CLERK_PUBLISHABLE_KEY` must be the same value as `CLERK_PUBLISHABLE_KEY` above.

---

## Step 5 — Set Up the Database

### If using local PostgreSQL, create the database first:

```bash
psql -U postgres -c "CREATE DATABASE learnhub;"
```

### Push the schema (creates all tables):

```bash
pnpm --filter @workspace/db run push
```

You'll see a list of tables being created: `users`, `courses`, `lessons`, `resources`, `subscriptions`, `progress`, `downloads`.

### Seed with sample data (courses + lessons + resources):

```bash
pnpm --filter @workspace/scripts run seed
```

Output:
```
🌱  Seeding database...
  → Inserting courses…     ✓ 4 courses inserted
  → Inserting lessons…     ✓ 12 lessons inserted
  → Inserting resources…   ✓ 6 resources inserted
✅  Seed complete!
```

---

## Step 6 — Start the Servers

You need two terminal windows running at the same time.

### Option A — VSCode Tasks (recommended)

Press `Ctrl+Shift+P` → type `Tasks: Run Task` → select **Start Both (Full Stack)**

This opens two integrated terminals automatically.

### Option B — Manual (two terminals side by side)

**Terminal 1 — API Server:**
```bash
pnpm --filter @workspace/api-server run dev
```
Wait for: `Server listening  port: 8080`

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/learn run dev
```
Wait for: `Local: http://localhost:3000/`

---

## Step 7 — Open the App

Go to **http://localhost:3000** in your browser.

You should see the KC Class BHW landing page with the courses listed.

---

## Step 8 — Make Yourself Admin

1. Click **Sign Up** on the site and create an account with your email
2. Open a database client (TablePlus, DBeaver, pgAdmin, or just `psql`) and run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Using `psql`:
```bash
psql "YOUR_DATABASE_URL" -c "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
```

3. Refresh the page — you now have access to **/admin**

---

## Step 9 — Replace Sample Data with Real Content

Go to **http://localhost:3000/admin** and:

1. **Edit courses** — update titles, descriptions, thumbnails with your real course info
2. **Add lessons** — for each lesson, paste the YouTube video ID (the part after `?v=` in the URL)
3. **Add resources** — upload PDF notes and other downloadable files

---

## Daily Workflow (after first setup)

Every time you want to work on the project:

```bash
# Terminal 1
pnpm --filter @workspace/api-server run dev

# Terminal 2
pnpm --filter @workspace/learn run dev
```

Or use the VSCode task: `Ctrl+Shift+P` → `Tasks: Run Task` → **Start Both (Full Stack)**

Changes to frontend files reload the browser automatically.
Changes to server files require waiting for the rebuild (takes ~3 seconds).

---

## Project Structure

```
kc-class-bhw/
├── artifacts/
│   ├── api-server/          ← Express API server (port 8080)
│   │   ├── src/routes/      ← API route handlers
│   │   └── .env             ← Your local server config (YOU CREATE THIS)
│   └── learn/               ← React frontend (port 3000)
│       ├── src/pages/       ← All page components
│       ├── src/components/  ← Shared UI components
│       └── .env             ← Your local frontend config (YOU CREATE THIS)
├── lib/
│   ├── db/                  ← Drizzle ORM schema + database connection
│   ├── api-spec/            ← OpenAPI spec (source of truth for API types)
│   ├── api-zod/             ← Generated Zod validation schemas
│   └── api-client-react/    ← Generated React Query hooks
├── scripts/
│   └── src/seed.ts          ← Database seed script
├── .vscode/                 ← VSCode settings (auto-configured)
└── .nvmrc                   ← Node.js version pin (24)
```

---

## All Commands Reference

| Command | What it does |
|---|---|
| `pnpm install` | Install all dependencies |
| `pnpm --filter @workspace/api-server run dev` | Start API server on port 8080 |
| `pnpm --filter @workspace/learn run dev` | Start frontend on port 3000 |
| `pnpm --filter @workspace/db run push` | Apply DB schema changes |
| `pnpm --filter @workspace/scripts run seed` | Seed database with sample data |
| `pnpm run typecheck` | Check for TypeScript errors across all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks after editing `openapi.yaml` |

---

## VSCode Extensions — Install These

When you open the project in VSCode, it will suggest recommended extensions.
Click **Install All** when prompted, or install manually:

| Extension | Purpose |
|---|---|
| **Prettier** | Auto-format code on save |
| **ESLint** | Code quality and error highlighting |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind classes |
| **TypeScript (Nightly)** | Better TypeScript support |
| **GitLens** | Inline Git blame and history |
| **SQLTools + SQLTools PG Driver** | Query your database from inside VSCode |

---

## Troubleshooting

### `pnpm: command not found`
Run `npm install -g pnpm` and restart your terminal.

### `Error: PORT environment variable is required`
`artifacts/api-server/.env` is missing or doesn't have `PORT=8080`.

### `Error: DATABASE_URL is not set`
Check that `artifacts/api-server/.env` has a valid `DATABASE_URL` line.

### `ECONNREFUSED 127.0.0.1:5432` (connection refused)
Your local PostgreSQL server is not running. Start it:
- **Windows**: Open Services → find PostgreSQL → Start
- **Mac**: `brew services start postgresql@14`
- **Linux**: `sudo systemctl start postgresql`

Or switch to Neon (free cloud) and update `DATABASE_URL`.

### Courses not loading / blank page
Make sure:
1. The API server is running (Terminal 1 shows `Server listening port: 8080`)
2. `VITE_API_URL=http://localhost:8080` is in `artifacts/learn/.env`

### Sign in / Clerk not working
Make sure:
- `VITE_CLERK_PUBLISHABLE_KEY` in `artifacts/learn/.env` matches `CLERK_PUBLISHABLE_KEY` in `artifacts/api-server/.env`
- You have an active internet connection (Clerk needs it even in dev mode)

### Schema push fails — `relation already exists`
Your database already has tables from a previous run. That is fine — ignore the warnings.
If you want a clean start:
```bash
# Drop and recreate the database
psql -U postgres -c "DROP DATABASE learnhub;"
psql -U postgres -c "CREATE DATABASE learnhub;"
pnpm --filter @workspace/db run push
pnpm --filter @workspace/scripts run seed
```

### TypeScript errors in VSCode editor
Run `pnpm run typecheck` in the terminal. If it passes there, the editor is using the wrong TypeScript version.
Press `Ctrl+Shift+P` → **TypeScript: Select TypeScript Version** → **Use Workspace Version**.

### `Cannot find module '@workspace/db'` etc.
Run `pnpm install` again — a workspace package link may have been lost.

### Windows: `'export' is not recognized`
This was a known bug — it is now fixed. Make sure you have the latest version of the project with `cross-env` in `artifacts/api-server/package.json`.

---

## Ready for Production?

When you're happy with the local version, publish to the internet:

1. **Replit Publish** (easiest — one click in Replit)
2. **Vercel + Render** — see `VERCEL_RENDER_DEPLOY.md`

For live payments, add your real eSewa credentials to the Secrets tab before publishing.
