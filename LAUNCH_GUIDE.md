# KC Class BHW — Launch Guide

Everything you need to go from a working local dev environment to a live website with real paying students.

---

## Prerequisites

Before launching, make sure:
- [ ] Local dev is working (see **SETUP.md**)
- [ ] You have added at least one published course with lessons
- [ ] You have tested a complete eSewa payment in sandbox mode (see Step 4)

---

## Step 1 — Create the Production Database

Your Replit-hosted app needs its own database separate from your local one.

1. Open your project in the browser at **replit.com**
2. Click the **Database** tab in the left sidebar (the cylinder icon)
3. Click **Create Database** — Replit creates a free PostgreSQL database automatically
4. The `DATABASE_URL` secret is set for you — no need to copy anything

Then create the tables:

1. Click the **Shell** tab in the left sidebar
2. Run:
   ```bash
   pnpm --filter @workspace/db run push
   ```
3. You should see all tables created successfully

---

## Step 2 — Set Up Clerk for Production

The Replit-managed Clerk integration provisions keys automatically when you deploy. No manual Clerk setup is needed on Replit — the `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` environment variables are provided by the platform.

If you want to use your **own** Clerk application instead:

1. Go to https://dashboard.clerk.com → your application → **API Keys**
2. Click the **Secrets** tab (lock icon) in your Replit project
3. Add these two secrets:
   | Name | Value |
   |---|---|
   | `CLERK_PUBLISHABLE_KEY` | `pk_live_...` (your Clerk publishable key) |
   | `CLERK_SECRET_KEY` | `sk_live_...` (your Clerk secret key) |

---

## Step 3 — Publish the App

1. In Replit, click the **Publish** button in the top-right corner
2. Choose a subdomain for your site — e.g. `kcclassbhw` → your site will be at `kcclassbhw.replit.app`
3. Click **Deploy**
4. Wait 2–3 minutes for the build to finish
5. Your site is now live

---

## Step 4 — Test a Full Payment (Sandbox)

Before accepting real money, test the complete payment flow with eSewa's test environment. No eSewa account is needed for this — sandbox mode is on by default.

1. Open your live site in an **incognito/private browser window**
2. Click **Sign Up** and create a test account
3. Go to **/pricing** and click **Pay Monthly** or **Pay Yearly**
4. You are redirected to eSewa's test payment page (`rc-epay.esewa.com.np`)
5. Log in with these test credentials:
   - **eSewa ID:** `9806800001` (or `9806800002` through `9806800005`)
   - **MPIN:** `1122`
   - **Password:** `Nepal@123`
6. Complete the payment
7. You are redirected back to **/payment/verify** — the page verifies the transaction
8. You land on **/dashboard** with your subscription active
9. Open a premium lesson — it should play
10. Go to **/resources** — you should see the resource vault

If all 10 steps work, the platform is ready for real payments.

---

## Step 5 — Make Yourself Admin on the Live Site

1. Sign up on the **live site** using your real email (do this in normal browser, not incognito)
2. Go back to Replit → click the **Database** tab → click **Query**
3. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```
4. Refresh the live site — you now have access to **/admin**

---

## Step 6 — Enable Real eSewa Payments

> Skip this step while testing. Come back here once you are ready to accept real NPR payments from students.

### Get your eSewa merchant account

1. Go to https://esewa.com.np/epay/merchant and apply for a merchant account
2. eSewa will provide you with:
   - A **Merchant Code** (also called Product Code)
   - A **Secret Key**

### Add secrets to Replit

1. In your Replit project, click the **Secrets** tab (lock icon in the left sidebar)
2. Add these secrets one by one:

| Secret Name | Value | Example |
|---|---|---|
| `ESEWA_PRODUCT_CODE` | Your eSewa merchant code | `ABC123` |
| `ESEWA_SECRET_KEY` | Your eSewa secret key | `8gBm/:&EnhH.1/q` |
| `ESEWA_MONTHLY_PRICE` | Monthly price in NPR | `299` |
| `ESEWA_YEARLY_PRICE` | Yearly price in NPR | `2399` |
| `ESEWA_ENV` | Set to exactly `production` | `production` |

3. After adding all secrets, restart the API server:
   - Click the **Workflows** panel in Replit
   - Find `artifacts/api-server: API Server` → click **Restart**

### Test with real money

Make one real payment to verify everything works end-to-end (you can pay yourself NPR 1 if eSewa allows it, or ask a trusted person to test). Confirm in **/admin** → Subscriptions that the subscription shows as active.

---

## Step 7 — Add Your Real Content

Go to **/admin/courses** on the live site and:

1. **Create your courses** — title, description, category, thumbnail URL, set Published on
2. **Add lessons** — for each lesson, paste the YouTube video ID  
   - Your video URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - The video ID is: `dQw4w9WgXcQ`
   - For premium lessons: set the video to **Unlisted** on YouTube before copying the ID
3. **Mark 1–2 lessons as Free Preview** per course so students can try before subscribing

---

## Step 8 — Connect a Custom Domain (Optional)

If you own a domain like `kcclassbhw.com`:

1. In Replit, go to your deployment settings → **Custom Domain**
2. Enter your domain name
3. Replit shows you two DNS records to add (A record and CNAME)
4. Log into your domain registrar (e.g. GoDaddy, Namecheap, Cloudflare) and add those records
5. Wait 15–60 minutes for DNS to propagate
6. Your site is now live at `kcclassbhw.com`

---

## Step 9 — Tell Your Students

Share the following with your students:

- **Website:** your `.replit.app` URL (or custom domain)
- **What is free:** All courses are browsable and 1–2 preview lessons per course are watchable without signing up
- **What requires a subscription:** All full lessons, PDF notes, and the resource vault
- **How to pay:** They need an eSewa account — most Nepali students already have one
- **Price:** NPR 299/month or NPR 2,399/year (33% savings)

---

## Ongoing — Adding New Content

### New YouTube video → Videos page

Nothing to do. The **/videos** page automatically shows your latest YouTube uploads within 10 minutes of publishing.

### New YouTube video → Premium lesson in a course

1. Go to **/admin/courses** → click **Manage Lessons** on the relevant course
2. Click **Add Lesson** → paste the YouTube video ID → fill in title, duration, order
3. Toggle **Published** on → click **Create Lesson**
4. Students with active subscriptions can watch immediately

---

## If Something Breaks After Launch

| Symptom | Where to check | What to do |
|---|---|---|
| Site shows an error or blank page | Replit → Workflows panel | Check both workflows are green. Click Restart if either is stopped. |
| "Database connection failed" | Replit → Secrets tab | Check `DATABASE_URL` is set |
| eSewa payments failing | Replit → Secrets tab | Check `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, `ESEWA_ENV=production` |
| Videos page is empty | Wait 10 minutes | The YouTube RSS feed refreshes every 10 minutes automatically |
| Students can't sign in | Clerk dashboard | Check your Clerk application is active and keys match |
| Admin panel not accessible | Database | Run `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';` |

---

## Quick Links

| Link | What it is |
|---|---|
| `/admin` | Stats, user list, subscription list |
| `/admin/courses` | Create and manage courses |
| `/admin/courses/:id/lessons` | Add and manage lessons |
| `/pricing` | What students see when subscribing |
| `/videos` | Auto-synced YouTube channel page |
| `/dashboard` | What a signed-in student sees |

---

## Summary Checklist

- [ ] Production database created and schema pushed (Step 1)
- [ ] App published on Replit (Step 3)
- [ ] Full sandbox eSewa payment tested end-to-end (Step 4)
- [ ] Promoted yourself to admin on the live site (Step 5)
- [ ] At least one published course with lessons added (Step 7)
- [ ] 1–2 free preview lessons set per course (Step 7)
- [ ] eSewa merchant account obtained and secrets added (Step 6)
- [ ] Real payment tested end-to-end (Step 6)
- [ ] YouTube Videos page confirmed working (auto-syncs)
- [ ] Live URL shared with students (Step 9)
