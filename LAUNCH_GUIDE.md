# KC Class BHW — Launch Guide

Everything you need to do, in order, to go from this project to a live website with real paying students.

---

## Step 1 — Set Up Your Database

Your app needs a PostgreSQL database to store users, courses, subscriptions, and progress.

1. In your Replit project, click the **Database** tab on the left sidebar
2. Click **Create Database** — Replit creates a free PostgreSQL database for you
3. It automatically sets the `DATABASE_URL` secret — you don't need to copy anything
4. Now push the table structure to the database:
   - Click the **Shell** tab and run:
   ```
   pnpm --filter @workspace/db run push
   ```
5. You should see a success message with all the table names

---

## Step 2 — Make Yourself an Admin

Right now nobody is an admin. You need to sign in to your own website first, then promote yourself.

1. Click **Publish** in Replit (top right) to get your live URL — something like `yourapp.replit.app`
2. Go to your live URL and click **Sign Up** — create your account
3. Go back to Replit → click the **Database** tab → click **Query**
4. Run this SQL (replace the email with your own):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```
5. Now when you visit `/admin` on your website, you'll have full access

---

## Step 3 — Add Your Courses

1. Go to `yourapp.replit.app/admin/courses`
2. Click **New Course**
3. Fill in:
   - **Title** — the name of your course (e.g. "B.Ed English Grammar Complete")
   - **Description** — what students will learn
   - **Category** — e.g. Grammar, Pedagogy, Phonetics, Literature
   - **Thumbnail URL** — paste any image URL for the course cover photo
   - Turn **Published** on so students can see it
4. Click **Create Course**
5. Repeat for each course you want to add

---

## Step 4 — Add Your Lessons

For each course you created:

1. Go to `/admin/courses` and click **Manage Lessons**
2. Click **Add Lesson**
3. Fill in:
   - **Title** — the lesson name
   - **Description / Notes** — text students see below the video
   - **YouTube Video ID** — copy this from your YouTube video URL:
     - Your URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
     - The ID is: `dQw4w9WgXcQ` (everything after `?v=`)
   - **Duration** — length in minutes
   - **Sort Order** — 1 for first lesson, 2 for second, etc.
   - Turn **Free Preview** on for 1–2 lessons per course so students can try before subscribing
   - Turn **Published** on
4. Click **Create Lesson**
5. Repeat for all your lessons

> **Tip for premium lessons:** Set your YouTube video to **Unlisted** before copying the ID. Unlisted videos don't show on your channel or in YouTube search — only people with the link can watch them. Your website controls who gets the link.

---

## Step 5 — Set Up eSewa Payments

### If you want to test first (sandbox — no real money)

Skip this step for now. The app already works in test mode with fake eSewa payments. Come back here when you're ready to accept real payments.

### When you're ready for real payments

1. Go to [esewa.com.np/epay/merchant](https://esewa.com.np/epay/merchant) and apply for a merchant account
2. eSewa will give you:
   - A **Merchant Code** (also called Product Code)
   - A **Secret Key**
3. In Replit, click the **Secrets** tab (lock icon on the left sidebar)
4. Add these secrets one by one:

   | Name | Value |
   |---|---|
   | `ESEWA_PRODUCT_CODE` | Your merchant code from eSewa |
   | `ESEWA_SECRET_KEY` | Your secret key from eSewa |
   | `ESEWA_MONTHLY_PRICE` | `299` (or whatever price you want in NPR) |
   | `ESEWA_YEARLY_PRICE` | `2399` (or whatever price you want in NPR) |
   | `ESEWA_ENV` | `production` |

5. After adding the secrets, restart the API server:
   - Go to the **Workflows** panel and restart `artifacts/api-server: API Server`

---

## Step 6 — Test a Full Payment

Before telling your students, test everything yourself end-to-end.

**In sandbox mode (before going live):**
1. Open your site in an incognito window
2. Sign up as a test student
3. Go to `/pricing` and click **Pay Monthly**
4. On the eSewa page, use these test credentials:
   - eSewa ID: `9806800001`
   - MPIN: `1122`
   - Password: `Nepal@123`
5. Complete the payment
6. You should land on your dashboard with subscription active
7. Try opening a premium lesson — it should play
8. Try downloading a resource — it should work

**After going live (with real eSewa):**
1. Pay yourself NPR 1 to test (or ask a friend to test)
2. Confirm the subscription activates in `/admin` → Subscriptions tab
3. Confirm the student can access all lessons

---

## Step 7 — Check Your YouTube Channel Sync

1. Go to `yourapp.replit.app/videos`
2. You should see your YouTube videos listed automatically
3. If they don't appear, your channel ID may need updating — contact your developer

---

## Step 8 — Publish Your Website

1. In Replit, click the **Publish** button (top right)
2. Choose a name for your `.replit.app` subdomain
3. Click **Deploy**
4. Wait 2–3 minutes for the build to complete
5. Your site is now live at `yourname.replit.app`

> **Custom domain (optional):** If you have a domain like `kcclassbhw.com`, you can connect it in the Replit Deployment settings after publishing.

---

## Step 9 — Tell Your Students

Your site is live. Here's what to share:

- **Website link** — your `.replit.app` URL (or custom domain)
- **What's free** — students can browse all courses and watch preview lessons without paying
- **What's paid** — all full lessons, PDF notes, and resources require a subscription
- **How to pay** — they need an eSewa account (most Nepali students already have one)
- **Price** — NPR 299/month or NPR 2,399/year (save 33%)

---

## Step 10 — Ongoing: Adding New Content

Every time you upload a new video to YouTube:

- **Videos page** — it appears automatically within 10 minutes. Nothing to do.
- **Course lessons** — go to `/admin/courses` → **Manage Lessons** → **Add Lesson** and paste the YouTube video ID. This is how you add premium content to your courses.

---

## Quick Reference — Important Links

| Link | What it is |
|---|---|
| `/admin` | Your admin dashboard — stats and user management |
| `/admin/courses` | Add and manage courses |
| `/admin/courses/:id/lessons` | Add and manage lessons inside a course |
| `/pricing` | What your students see when they want to subscribe |
| `/videos` | Auto-synced YouTube channel page |
| `/dashboard` | What a logged-in student sees |

---

## If Something Breaks

1. Check the **Workflows** panel in Replit — both `API Server` and `web` should be green/running
2. If the API server has stopped, click restart
3. If the database is not connecting, check that `DATABASE_URL` is set in your Secrets tab
4. If eSewa payments are failing, double-check `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, and `ESEWA_ENV` in Secrets
5. If your YouTube videos are not showing, wait 10 minutes — the feed refreshes automatically

---

## Summary Checklist

- [ ] Database created and schema pushed
- [ ] Signed up on the live site and promoted yourself to admin
- [ ] At least one course added and published
- [ ] At least one lesson added per course with a YouTube video ID
- [ ] 1–2 free preview lessons set per course
- [ ] eSewa merchant account applied for (or sandbox mode tested)
- [ ] eSewa secrets added to Replit (when ready for real payments)
- [ ] Full payment tested end-to-end
- [ ] YouTube Videos page showing your channel videos
- [ ] App published and live URL shared with students
