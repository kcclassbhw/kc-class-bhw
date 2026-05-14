# KC Class BHW — Launch Guide

Go from a working local setup to a live website accepting real student subscriptions.

---

## Before You Start

Make sure these are done:
- [ ] Local development is working (see **SETUP.md**)
- [ ] At least one published course with lessons exists
- [ ] You have tested the full payment flow in sandbox mode (Step 4 below)

---

## Step 1 — Create the Production Database

Your live app on Replit needs its own separate database.

1. Open your Replit project at https://replit.com
2. Click the **Database** icon in the left sidebar
3. Click **Create Database** — Replit creates a free PostgreSQL database and sets `DATABASE_URL` automatically
4. Click the **Shell** tab and run:
   ```bash
   pnpm --filter @workspace/db run push
   ```
5. You should see all tables created successfully

---

## Step 2 — Publish the App

1. Click the **Publish** button in the top-right of Replit
2. Choose a subdomain — e.g. `kcclassbhw` → your site will be at `kcclassbhw.replit.app`
3. Click **Deploy** and wait 2–3 minutes for the build to finish
4. Your site is now live

> **Note on Clerk:** Replit automatically provisions Clerk auth keys for your deployed app. You do not need to set `CLERK_PUBLISHABLE_KEY` or `CLERK_SECRET_KEY` manually on Replit.

---

## Step 3 — Make Yourself Admin on the Live Site

1. Open your live URL in a **normal browser window** (not incognito)
2. Click **Sign Up** and create your account using your real email
3. Go back to Replit → click the **Database** tab → click **Query**
4. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```
5. Refresh your live site — the **Admin** link now appears in the nav bar

---

## Step 4 — Test a Full Payment (Sandbox Mode — No Real Money)

Before accepting real money, verify the entire payment flow end-to-end using eSewa's test environment. No eSewa account is needed — sandbox mode is on by default.

1. Open your live site in an **incognito / private** browser window
2. **Sign Up** as a test student with a throwaway email
3. Go to **/pricing** → click **Pay Monthly** or **Pay Yearly**
4. You are redirected to eSewa's sandbox payment page (`rc-epay.esewa.com.np`)
5. Log in with these test credentials:
   - **eSewa ID:** `9806800001` (or `9806800002` through `9806800005`)
   - **MPIN:** `1122`
   - **Password:** `Nepal@123`
6. Confirm the payment on the eSewa page
7. You are redirected back to **/payment/verify** — it verifies and activates the subscription
8. You land on **/dashboard** with an active subscription
9. Open a premium lesson — it should play
10. Go to **/resources** — the resource vault should be accessible

If all 10 steps work without errors, the platform is ready for real payments.

---

## Step 5 — Enable Real eSewa Payments

> Skip this step until you are ready to accept real NPR payments from students.

### Get your eSewa merchant account

Apply at https://esewa.com.np/epay/merchant — eSewa will give you:
- A **Merchant Code** (also called Product Code)
- A **Secret Key**

### Add secrets to Replit

1. In Replit, click the **Secrets** tab (lock icon in the left sidebar)
2. Add each secret one at a time:

| Secret Name | Value to enter |
|---|---|
| `ESEWA_PRODUCT_CODE` | Your eSewa merchant code |
| `ESEWA_SECRET_KEY` | Your eSewa secret key |
| `ESEWA_MONTHLY_PRICE` | `299` (or your preferred NPR price) |
| `ESEWA_YEARLY_PRICE` | `2399` (or your preferred NPR price) |
| `ESEWA_ENV` | `production` (must be exactly this) |

3. After saving all secrets, restart the API server:
   - Open the **Workflows** panel in Replit
   - Find `artifacts/api-server: API Server` → click **Restart**

### Verify with a real payment

Make one real payment yourself to confirm everything works end-to-end. Then check **/admin** → Subscriptions to confirm the subscription activated.

---

## Step 6 — Add Your Real Content

Go to **http://yoursite.replit.app/admin/courses** and add your actual courses.

### Create a course
- **Title** — e.g. `B.Ed English Grammar Complete`
- **Description** — what students will learn in this course
- **Category** — Grammar, Pedagogy, Phonetics, or Literature
- **Thumbnail URL** — paste a direct image URL for the course cover photo
- Toggle **Published** on → click **Create Course**

### Add lessons to a course

Click **Manage Lessons** → **Add Lesson** for each lesson:

- **Title** — lesson name shown in the list
- **YouTube Video ID** — from your video URL:
  - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  - ID: `dQw4w9WgXcQ` (everything after `?v=`)
- **Duration (minutes)** — shown in the lesson list
- **Sort Order** — `1` for first lesson, `2` for second, etc.
- Toggle **Free Preview** on for 1–2 lessons per course
- Toggle **Published** on → click **Create Lesson**

> **For premium lessons:** Set the YouTube video to **Unlisted** before copying the ID. Unlisted videos do not appear in YouTube search or on your public channel page — only your website provides the link.

---

## Step 7 — Connect a Custom Domain (Optional)

If you own a domain like `kcclassbhw.com`:

1. In Replit, open your deployment settings → **Custom Domain**
2. Enter your domain
3. Replit shows you DNS records to add (an A record and a CNAME)
4. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add those records
5. Wait 15–60 minutes for DNS propagation
6. Your site is live at `kcclassbhw.com`

---

## Step 8 — Tell Your Students

What to share:

- **Your website URL** — `yourname.replit.app` or your custom domain
- **What is free** — all courses are browsable and 1–2 preview lessons per course are watchable without signing up
- **What requires a subscription** — all full lessons, PDF notes, and the resource vault
- **How to pay** — students need an eSewa account (most Nepali students already have one)
- **Price** — NPR 299/month or NPR 2,399/year (33% savings on yearly)

---

## Ongoing — Adding New Content

### New YouTube video → Videos page

Nothing to do. The **/videos** page reads your YouTube channel's RSS feed and shows new uploads automatically within 10 minutes of publishing.

### New YouTube video → Premium lesson in a course

1. Go to **/admin/courses** → click **Manage Lessons** on the relevant course
2. Click **Add Lesson** → paste the YouTube video ID → fill in title, duration, order
3. Toggle **Published** on → click **Create Lesson**

Students with active subscriptions can watch immediately.

---

## Troubleshooting Live Issues

| Symptom | Where to look | Fix |
|---|---|---|
| Site shows error or blank page | Replit → Workflows panel | Both workflows should be green. Click **Restart** on any that are stopped. |
| "Database connection failed" | Replit → Secrets tab | Check `DATABASE_URL` is present |
| eSewa payments failing | Replit → Secrets tab | Check `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, `ESEWA_ENV=production` are all set |
| Videos page empty | Wait 10 minutes | RSS feed refreshes automatically every 10 minutes |
| Students can't sign in | Clerk dashboard | Check your Clerk application is active |
| /admin shows "Access denied" | Database | Run `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';` in the Database query tab |

---

## Quick Admin Links

| Link | What it does |
|---|---|
| `/admin` | Platform stats, user list, subscription list |
| `/admin/courses` | Create and manage courses |
| `/admin/courses/:id/lessons` | Add and manage lessons |
| `/pricing` | What students see when subscribing |
| `/videos` | Auto-synced YouTube channel page |
| `/dashboard` | What a signed-in student sees |

---

## Launch Checklist

- [ ] Production database created and schema pushed (Step 1)
- [ ] App published on Replit — live URL confirmed (Step 2)
- [ ] Promoted yourself to admin on the live site (Step 3)
- [ ] Full sandbox eSewa payment tested end-to-end (Step 4)
- [ ] eSewa merchant account obtained (Step 5)
- [ ] eSewa production secrets added to Replit (Step 5)
- [ ] Real eSewa payment tested (Step 5)
- [ ] At least one published course with lessons added (Step 6)
- [ ] 1–2 free preview lessons set per course (Step 6)
- [ ] YouTube Videos page confirmed working (auto)
- [ ] Live URL shared with students (Step 8)
