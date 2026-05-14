# KC Class BHW — Local Development Setup Guide

**Platform:** Windows 11 · VSCode · Node 22 · pnpm · Git  
**Time to complete first setup:** ~20 minutes

---

## What You Will Have at the End

| Service | URL | What it does |
|---|---|---|
| Frontend (React) | http://localhost:3000 | The full KC Class BHW website |
| API Server (Express) | http://localhost:8080 | Backend — courses, auth, payments |

---

## Prerequisites

Before cloning the project, verify you have everything installed.

Open **PowerShell** or the **Windows Terminal** and run each check:

```powershell
node --version
```
Must show `v22.x.x` or higher. If not, download from https://nodejs.org (choose LTS).

```powershell
pnpm --version
```
Must show `9.x.x` or higher (10.x and 11.x also work). If not installed:
```powershell
npm install -g pnpm
```

```powershell
git --version
```
Must show any version. If not installed, download from https://git-scm.com/downloads.

---

## Step 1 — Get the Code

Open **PowerShell** or **Windows Terminal** in the folder where you keep projects (e.g. `C:\projects`), then run:

```powershell
git clone https://github.com/BugBasherX/KC-Class.git
cd KC-Class
```

Open the project in VSCode:

```powershell
code .
```

When VSCode opens it will suggest installing recommended extensions — click **Install All**. This gives you Tailwind autocomplete, Prettier formatting, and SQLTools for database queries.

---

## Step 2 — Install Dependencies

In the VSCode terminal (`Ctrl+`` ` ``), run:

```powershell
pnpm install
```

This installs all packages for the frontend, API server, and shared libraries at once. Takes 1–3 minutes on the first run. You will see a progress bar and finally `Done in X.Xs`.

> **If you see `Error: Use pnpm instead of npm/yarn`** — you ran `npm install` instead of `pnpm install`. Run `pnpm install` instead.

---

## Step 3 — Create the Environment Files

The project needs two `.env` files — one for the frontend, one for the API server. Neither is committed to Git (they contain secrets).

### Option A — File Explorer (easiest on Windows)

1. Open File Explorer and navigate to the project folder
2. Go into `artifacts\learn\` — copy `.env.example`, paste it in the same folder, rename the copy to `.env`
3. Go into `artifacts\api-server\` — copy `.env.example`, paste it in the same folder, rename the copy to `.env`

### Option B — PowerShell

```powershell
copy artifacts\learn\.env.example       artifacts\learn\.env
copy artifacts\api-server\.env.example  artifacts\api-server\.env
```

---

## Step 4 — Set Up a Database

The API server needs a PostgreSQL database. Choose one of these two options.

### Option A — Neon (free cloud database, no install needed — recommended)

1. Go to https://neon.tech and sign up (free, no credit card)
2. Click **New Project** → name it `kc-class-bhw` → click **Create Project**
3. On the dashboard, click **Connect** → copy the connection string. It looks like:
   ```
   postgresql://username:password@ep-something.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Open `artifacts\api-server\.env` in VSCode and replace the `DATABASE_URL` line with your connection string:
   ```env
   DATABASE_URL=postgresql://username:password@ep-something.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Option B — Local PostgreSQL

1. Download from https://www.postgresql.org/download/windows/ and install (keep defaults)
2. During install, set a password for the `postgres` user — remember it
3. After install, open **pgAdmin** (installed with PostgreSQL) or open **SQL Shell (psql)** from the Start menu
4. Create the database:
   ```sql
   CREATE DATABASE learnhub;
   ```
5. Open `artifacts\api-server\.env` and set:
   ```env
   DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/learnhub
   ```

> **Verify PostgreSQL is running:** Open Services (`Win+R` → `services.msc`) and check that `postgresql-x64-XX` is listed as **Running**. If not, right-click it → Start.

---

## Step 5 — Get Your Clerk Auth Keys

Clerk handles sign-in and sign-up. You need a free Clerk account to get keys.

1. Go to https://dashboard.clerk.com and sign up (free)
2. Click **Create Application** → give it any name (e.g. `KC Class BHW`) → click **Create**
3. In the left sidebar, go to **API Keys**
4. You will see two keys:
   - **Publishable key** — starts with `pk_test_...`
   - **Secret key** — starts with `sk_test_...`

### Add keys to `artifacts\learn\.env`

Open the file and set:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
```

The `VITE_API_URL` and `VITE_CLERK_PROXY_URL` lines should already be correct for local dev:

```env
VITE_API_URL=http://localhost:8080
VITE_CLERK_PROXY_URL=http://localhost:8080/api/__clerk
PORT=3000
BASE_PATH=/
```

### Add keys to `artifacts\api-server\.env`

Open the file and set both keys:

```env
PORT=8080
NODE_ENV=development
DATABASE_URL=postgresql://...   ← from Step 4
CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_PASTE_YOUR_SECRET_KEY_HERE
```

> Both files must use the **same** `pk_test_...` publishable key.

---

## Step 6 — Push the Database Schema

This creates all the tables (`users`, `courses`, `lessons`, `resources`, `subscriptions`, `progress`, `downloads`) in your database.

In the VSCode terminal:

```powershell
pnpm --filter @workspace/db run push
```

Expected output:
```
Applying schema...
  ✓ users
  ✓ courses
  ✓ lessons
  ✓ resources
  ✓ subscriptions
  ✓ progress
  ✓ downloads
Schema applied successfully.
```

> If you see `DATABASE_URL is not set` — check that `artifacts\api-server\.env` exists and has the `DATABASE_URL` line filled in.
> If you see `ECONNREFUSED 127.0.0.1:5432` — your local PostgreSQL is not running (see Step 4 Option B). Or switch to Neon.

---

## Step 7 — Start the Servers

You need both servers running at the same time. You have two ways to do this.

### Option A — VSCode Task (recommended, one click)

1. Press `Ctrl+Shift+P`
2. Type `Tasks: Run Task` and press Enter
3. Select **Start Both (Full Stack)**

VSCode opens two terminals side by side — one for the API server, one for the frontend. Both start in parallel.

### Option B — Two terminals manually

**Terminal 1 — API Server:**
```powershell
pnpm --filter @workspace/api-server run dev
```
Wait for this line before continuing:
```
Server listening  port: 8080
```

**Terminal 2 — Frontend** (open a new terminal with `Ctrl+Shift+5` or the `+` button):
```powershell
pnpm --filter @workspace/learn run dev
```
Wait for:
```
  ➜  Local:   http://localhost:3000/
```

---

## Step 8 — Open the App

Go to **http://localhost:3000** in your browser (Chrome or Edge recommended).

You should see the KC Class BHW landing page. Click **Sign Up** to create your first account.

---

## Step 9 — Make Yourself Admin

After signing up on the site, promote your account to admin so you can manage courses and users.

### Find your user in the database

**Using SQLTools in VSCode (easiest):**
1. Press `Ctrl+Shift+P` → **SQLTools: New Connection** → choose PostgreSQL
2. Fill in your database connection details → click **Test Connection** → **Save**
3. Open the connection → run:
   ```sql
   SELECT clerk_id, email, role FROM users;
   ```
4. Copy your `clerk_id` value, then run:
   ```sql
   UPDATE users SET role = 'admin' WHERE clerk_id = 'user_PASTE_YOUR_CLERK_ID';
   ```

**Using psql (local PostgreSQL only):**
```powershell
psql -U postgres -d learnhub -c "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
```

**Using Neon dashboard:**
1. Open your Neon project → click **SQL Editor**
2. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```

After updating, **refresh the page** in your browser. You will now see the **Admin** link in the navigation.

---

## Step 10 — Add Your First Course

1. Go to http://localhost:3000/admin/courses
2. Click **New Course**
3. Fill in:
   - **Title** — e.g. `B.Ed English Grammar Complete`
   - **Description** — what students will learn
   - **Category** — Grammar, Pedagogy, Phonetics, or Literature
   - **Thumbnail URL** — paste any direct image URL for the course cover
   - Toggle **Published** on
4. Click **Create Course**

### Add lessons to the course

1. Click **Manage Lessons** on the course you just created
2. Click **Add Lesson**
3. Fill in:
   - **Title** — lesson name
   - **YouTube Video ID** — the part after `?v=` in your YouTube URL  
     e.g. for `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → the ID is `dQw4w9WgXcQ`
   - **Duration (minutes)**, **Sort Order** (1 = first lesson)
   - Toggle **Free Preview** on for 1–2 lessons per course
   - Toggle **Published** on
4. Click **Create Lesson**

> **Tip for premium content:** Set your YouTube video to **Unlisted** so it does not appear in YouTube search. Only your website will have the link.

---

## Daily Workflow

After the first setup, every time you want to work on the project:

```powershell
# Option A — VSCode Task
Ctrl+Shift+P → Tasks: Run Task → Start Both (Full Stack)

# Option B — Two terminals
pnpm --filter @workspace/api-server run dev   # Terminal 1
pnpm --filter @workspace/learn run dev         # Terminal 2
```

Then open http://localhost:3000.

Changes to frontend files reload the browser automatically.  
Changes to API server files rebuild and restart the server automatically (~3 seconds).

---

## All Commands Reference

| Command | What it does |
|---|---|
| `pnpm install` | Install all dependencies (run once after cloning) |
| `pnpm --filter @workspace/api-server run dev` | Start API server on port 8080 |
| `pnpm --filter @workspace/learn run dev` | Start frontend on port 3000 |
| `pnpm --filter @workspace/db run push` | Apply DB schema changes to your database |
| `pnpm run typecheck` | Check TypeScript errors across all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks (only needed after editing `openapi.yaml`) |

---

## Project Structure

```
KC-Class/
├── artifacts/
│   ├── api-server/              API server (Express, port 8080)
│   │   ├── src/
│   │   │   ├── routes/          All API route handlers
│   │   │   ├── middlewares/     Clerk proxy middleware
│   │   │   └── app.ts           Express app setup
│   │   ├── .env                 YOUR local config (you create this)
│   │   └── .env.example         Template — copy this to .env
│   │
│   └── learn/                   React frontend (Vite, port 3000)
│       ├── src/
│       │   ├── pages/           All page components
│       │   ├── components/      Shared UI components
│       │   └── App.tsx          Router + Clerk provider setup
│       ├── .env                 YOUR local config (you create this)
│       └── .env.example         Template — copy this to .env
│
├── lib/
│   ├── db/                      PostgreSQL schema (Drizzle ORM)
│   ├── api-spec/                OpenAPI spec — source of truth for the API
│   ├── api-zod/                 Auto-generated Zod validation schemas
│   └── api-client-react/        Auto-generated React Query hooks
│
├── scripts/                     Utility scripts
├── SETUP.md                     This file
├── LAUNCH_GUIDE.md              How to go live (publish + eSewa payments)
└── README.md                    Full technical reference
```

---

## Troubleshooting

### `pnpm install` fails immediately
Make sure you are running `pnpm install`, not `npm install`. The project requires pnpm.

### `Error: PORT environment variable is required`
`artifacts\api-server\.env` is missing or does not have `PORT=8080`. Create the file from `.env.example`.

### `Error: DATABASE_URL is not set`
`artifacts\api-server\.env` is missing or does not have a `DATABASE_URL` line. Fill it in (Step 4).

### `ECONNREFUSED 127.0.0.1:5432`
Your local PostgreSQL is not running.  
- Open Services (`Win+R` → `services.msc`) → find `postgresql-x64-XX` → right-click → Start  
- Or switch to Neon (free cloud, no local install needed — Step 4 Option A)

### Blank white page at localhost:3000
Open browser DevTools (`F12`) → Console tab. If you see `Missing VITE_CLERK_PUBLISHABLE_KEY`, the frontend `.env` file is missing or the key is still `pk_test_REPLACE_ME`. Complete Step 5.

### "Courses not loading" or blank course list
Make sure the API server is running (Terminal 1 shows `Server listening  port: 8080`) and that `VITE_API_URL=http://localhost:8080` is in `artifacts\learn\.env`.

### Sign-in / Clerk not working
- Confirm `VITE_CLERK_PUBLISHABLE_KEY` in `artifacts\learn\.env` matches `CLERK_PUBLISHABLE_KEY` in `artifacts\api-server\.env`
- Confirm you have an active internet connection (Clerk requires it even in dev mode)

### Schema push fails — `relation already exists`
Your database already has the tables from a previous run — this is fine, ignore the message. If you want a completely clean start:
```powershell
# Neon: drop and recreate via the Neon dashboard SQL editor
DROP DATABASE learnhub;
CREATE DATABASE learnhub;

# Local PostgreSQL
psql -U postgres -c "DROP DATABASE learnhub;"
psql -U postgres -c "CREATE DATABASE learnhub;"
pnpm --filter @workspace/db run push
```

### TypeScript errors showing in VSCode but `pnpm run typecheck` passes
The editor is using the wrong TypeScript version. Press `Ctrl+Shift+P` → **TypeScript: Select TypeScript Version** → **Use Workspace Version**.

### `Cannot find module '@workspace/db'` or similar
A workspace package link was lost. Run `pnpm install` again.

### VSCode terminal shows `'pnpm' is not recognized`
pnpm is not on your PATH. Close VSCode completely, then reopen it. If still not found, run `npm install -g pnpm` in PowerShell and restart.

---

## VSCode Extensions — Install These

When you open the project, VSCode suggests the recommended extensions automatically — click **Install All**.

| Extension | What it does |
|---|---|
| **Prettier** | Formats code on save |
| **ESLint** | Flags code quality issues as you type |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind class names |
| **TypeScript (Nightly)** | Better TypeScript language support |
| **GitLens** | Inline Git blame and file history |
| **SQLTools + SQLTools PostgreSQL Driver** | Query your database from inside VSCode |

---

## Ready to Go Live?

See **LAUNCH_GUIDE.md** for the complete step-by-step guide to:
- Publishing to the internet (one click on Replit)
- Connecting your eSewa merchant account for real NPR payments
- Setting up a custom domain (e.g. `kcclassbhw.com`)
