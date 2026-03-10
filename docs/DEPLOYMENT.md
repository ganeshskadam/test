# FlowQueue – Free Deployment Guide

Total monthly cost: **$0**

| Service | Platform | Free Tier |
|---------|----------|-----------|
| Frontend | Vercel | Unlimited hobby projects |
| Backend API | Render.com | 750 hours/month |
| PostgreSQL | Render.com | 1 GB free |

---

## 1. Deploy Database (Render PostgreSQL)

1. Go to https://render.com and sign in with GitHub.
2. Click **New +** → **PostgreSQL**.
3. Configure:
   - **Name**: `flowqueue-db`
   - **Plan**: Free
4. Click **Create Database**.
5. Copy the **Internal Database URL** – you'll need it in the next step.

---

## 2. Deploy Backend (Render Web Service)

1. In Render, click **New +** → **Web Service**.
2. Connect your GitHub repository (`ganeshskadam/test`).
3. Configure:
   - **Name**: `flowqueue-api`
   - **Environment**: Node
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (Internal Database URL from step 1) |
   | `JWT_SECRET` | (generate a random 64-char string) |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://flowqueue.vercel.app` (update after step 3) |

5. Click **Create Web Service**.
6. Wait for the first deployment to succeed (~3–5 min).
7. Note your API URL: `https://flowqueue-api.onrender.com`

### Seed Production Database

After the first deploy, open the **Shell** tab in Render and run:
```bash
npx ts-node prisma/seed.ts
```

---

## 3. Deploy Frontend (Vercel)

1. Go to https://vercel.com and sign in with GitHub.
2. Click **New Project** → Import `ganeshskadam/test`.
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/web`
4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://flowqueue-api.onrender.com/api` |
   | `NEXT_PUBLIC_APP_NAME` | `FlowQueue` |

5. Click **Deploy**.
6. Your app is live at `https://flowqueue.vercel.app` (or your custom domain).

---

## 4. Update CORS Origin

Go back to Render → `flowqueue-api` → **Environment** and update:
```
FRONTEND_URL = https://flowqueue.vercel.app
```

Trigger a redeploy.

---

## 5. Verify Deployment

1. Open https://flowqueue.vercel.app
2. Login with `owner@flowqueue.com` / `owner123`
3. Check the admin approval dashboard

---

## Custom Domain (Optional, ~$10/year)

- Buy a domain on Namecheap or Google Domains.
- In Vercel → **Domains** → add your domain.
- In Render → **Custom Domain** → add `api.yourdomain.com`.
- Update `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` accordingly.

---

## Keeping the Free Tier Alive

Render free web services spin down after 15 minutes of inactivity and take ~30 seconds to wake up. To avoid cold starts:

- Use a free uptime monitor like [UptimeRobot](https://uptimerobot.com/) to ping `https://flowqueue-api.onrender.com/health` every 10 minutes.
