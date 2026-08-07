# Deployment Guide: Vercel (Frontend) & Render (Backend)

This guide details how to deploy the monorepo application: the Next.js frontend (`apps/web`) to **Vercel** and the Express API backend (`apps/server`) to **Render**.

---

## 1. Backend Deployment (Render)

### Option A: Automatic Blueprint Deployment (`render.yaml`)
1. Push your repository to GitHub / GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your repository. Render will automatically detect [`render.yaml`](file:///c:/Users/abina/ss/OneDrive/Desktop/chatbot/render.yaml).
5. Fill in required environment secrets (`DATABASE_URL`, `REDIS_URL`, `CORS_ORIGIN`, `GEMINI_API_KEY`).
6. Click **Apply**. Render will build and deploy your Express API server.

### Option B: Manual Web Service Setup
- **Environment**: Node
- **Build Command**: `npm install && npm run build:server`
- **Start Command**: `node apps/server/dist/server.js`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `5000` (or leave default for Render `$PORT`)
  - `DATABASE_URL`: PostgreSQL connection string (Render Postgres, Neon, or Supabase)
  - `REDIS_URL`: Redis connection string (Upstash or Redis Cloud)
  - `JWT_ACCESS_SECRET`: Generate a 64-char random hex key
  - `JWT_REFRESH_SECRET`: Generate a 64-char random hex key
  - `COOKIE_SECRET`: Generate a 64-char random hex key
  - `CORS_ORIGIN`: Your Vercel frontend URL (e.g. `https://your-app.vercel.app`)

---

## 2. Frontend Deployment (Vercel)

1. Log into [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Vercel automatically detects [`vercel.json`](file:///c:/Users/abina/ss/OneDrive/Desktop/chatbot/vercel.json):
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `apps/web/.next`
5. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render API URL (e.g. `https://chatbot-api.onrender.com/api/v1`)
6. Click **Deploy**.

---

## 3. Post-Deployment Verification

1. Access your Vercel URL (e.g. `https://your-app.vercel.app`).
2. Test user registration and login.
3. Open browser Developer Tools network tab to verify API calls successfully hit your Render backend URL.
