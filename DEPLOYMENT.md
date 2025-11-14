# SettlementApp Deployment Guide

Complete step-by-step guide for deploying the SettlementApp to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment](#backend-deployment)
   - [Option 1: Railway](#option-1-deploy-to-railway-recommended)
   - [Option 2: Render](#option-2-deploy-to-render)
   - [Option 3: Vercel](#option-3-deploy-to-vercel)
4. [Frontend Deployment](#frontend-deployment)
   - [Vercel (Recommended)](#deploy-frontend-to-vercel)
   - [Netlify](#deploy-frontend-to-netlify)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ MongoDB Atlas account (free tier works great)
- ✅ Deployment platform account (Railway/Render/Vercel)
- ✅ Node.js 18+ installed locally (for testing)

---

## MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://cloud.mongodb.com and sign in
2. Click **"Build a Database"**
3. Choose **FREE (M0)** tier
4. Select cloud provider and region (closest to your users)
5. Cluster Name: `settlement` (or any name)
6. Click **"Create"**
7. Wait 1-3 minutes for cluster to deploy

### Step 2: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `settlementapp` (or choose your own)
5. Password: Generate a strong password and **save it securely**
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Choose one:
   - **"Allow Access From Anywhere"** (0.0.0.0/0) - easiest for deployment
   - Or add specific IPs of your deployment platform
4. Click **"Confirm"**
5. Wait 1-2 minutes for changes to propagate

### Step 4: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Driver: **Node.js** Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=settlement
   ```
6. Replace `<username>` and `<password>` with your actual credentials
7. **Save this connection string** - you'll need it for deployment!

---

## Backend Deployment

### Option 1: Deploy to Railway (Recommended)

Railway offers the easiest deployment with automatic builds and scaling.

#### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Verify your account

#### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `nwinnie450/SettlementApp`
4. Railway will detect it's a Node.js project

#### Step 3: Configure Backend Service

1. Railway will ask which directory to deploy
2. Select **`backend`** directory
3. Click **"Add variables"** to set environment variables:

```env
MONGODB_URI=mongodb+srv://settlementapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/settlementapp?retryWrites=true&w=majority&appName=settlement
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-TO-RANDOM-STRING-min-32-chars
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### Step 4: Deploy

1. Click **"Deploy"**
2. Railway will:
   - Install dependencies (`npm install`)
   - Build TypeScript (`npm run build` if configured)
   - Start server (`npm run dev` or `npm start`)
3. Wait 2-5 minutes for deployment
4. Railway will provide a URL: `https://your-app.railway.app`

#### Step 5: Generate Domain (Optional)

1. Go to **Settings** > **Networking**
2. Click **"Generate Domain"**
3. Your backend will be available at: `https://settlement-app-production.up.railway.app`

#### Step 6: Test Backend

```bash
curl https://your-app.railway.app/health

# Should return:
# {"status":"OK","message":"Settlement App Backend is running","timestamp":"..."}
```

---

### Option 2: Deploy to Render

Render offers free tier with automatic deployments from Git.

#### Step 1: Sign Up for Render

1. Go to https://render.com
2. Sign up with GitHub
3. Verify your account

#### Step 2: Create Web Service

1. Click **"New +"** > **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `settlement-app-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main` or your deployment branch
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` or `node dist/server.js`
   - **Plan:** Free (or Starter for better performance)

#### Step 3: Add Environment Variables

Click **"Advanced"** and add:

```env
MONGODB_URI=mongodb+srv://settlementapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/settlementapp?retryWrites=true&w=majority&appName=settlement
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-TO-RANDOM-STRING-min-32-chars
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Note:** PORT is automatically set by Render, don't add it.

#### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. Wait 5-10 minutes for first deployment
4. Your backend will be at: `https://settlement-app-backend.onrender.com`

#### Step 5: Test Backend

```bash
curl https://settlement-app-backend.onrender.com/health
```

**Note:** Free tier on Render spins down after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

---

### Option 3: Deploy to Vercel

Vercel is great for serverless deployment (works well for APIs with light traffic).

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Configure for Vercel

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Deploy

```bash
cd backend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? settlement-backend
# - Directory? ./
# - Override settings? No
```

#### Step 4: Add Environment Variables

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add FRONTEND_URL
```

Or add via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each variable

#### Step 5: Deploy to Production

```bash
vercel --prod
```

Your backend will be at: `https://settlement-backend.vercel.app`

---

## Frontend Deployment

### Deploy Frontend to Vercel

#### Step 1: Update Frontend Configuration

1. Update `VITE_API_URL` in your frontend code to point to your deployed backend:

Create `.env.production`:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

2. Update `.gitignore` to allow `.env.production`:

```gitignore
# Environment files
.env
.env.local
.env.development.local
# .env.production  <- Comment this out or remove
```

#### Step 2: Deploy to Vercel

```bash
# From project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? settlement-app
# - Directory? ./
# - Override settings? No
```

#### Step 3: Configure Build Settings

Vercel should auto-detect Vite, but verify:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Step 4: Add Environment Variable

Via Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. **Settings** > **Environment Variables**
4. Add:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app`
   - Environment: Production

#### Step 5: Deploy to Production

```bash
vercel --prod
```

Your frontend will be at: `https://settlement-app.vercel.app`

---

### Deploy Frontend to Netlify

#### Step 1: Sign Up for Netlify

1. Go to https://netlify.com
2. Sign up with GitHub

#### Step 2: Create New Site

1. Click **"Add new site"** > **"Import an existing project"**
2. Choose **GitHub**
3. Select your repository
4. Configure:
   - **Branch:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

#### Step 3: Environment Variables

1. Go to **Site settings** > **Environment variables**
2. Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

#### Step 4: Deploy

Click **"Deploy site"**

Your frontend will be at: `https://random-name-12345.netlify.app`

You can customize the domain in **Site settings** > **Domain management**

---

## Post-Deployment

### 1. Update CORS Settings

Update your backend's `FRONTEND_URL` environment variable with your actual frontend URL:

```env
FRONTEND_URL=https://settlement-app.vercel.app
```

Redeploy backend if needed.

### 2. Test the Integration

1. Visit your frontend URL
2. Register a new account
3. Create a group
4. Add an expense
5. Check settlements

### 3. Set Up Custom Domains (Optional)

#### For Backend (Railway):
1. Go to **Settings** > **Networking** > **Custom Domain**
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

#### For Frontend (Vercel):
1. Go to **Settings** > **Domains**
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS records as instructed

### 4. Enable HTTPS

All platforms (Railway, Render, Vercel, Netlify) provide automatic HTTPS. Your URLs will use `https://` by default.

### 5. Monitor Your Application

- **Railway:** Built-in logs and metrics dashboard
- **Render:** Logs tab in service dashboard
- **Vercel:** Functions logs and analytics
- **MongoDB Atlas:** Monitor database performance in Atlas dashboard

---

## Troubleshooting

### Backend Issues

#### Issue: "Cannot connect to MongoDB"
**Solution:**
1. Check MongoDB Network Access allows your deployment IP
2. Verify connection string is correct
3. Ensure user credentials are correct
4. Check MongoDB Atlas cluster is not paused

#### Issue: "JWT errors"
**Solution:**
1. Ensure `JWT_SECRET` is set and matches between deployments
2. Use a strong secret (min 32 characters)
3. Don't use spaces or special characters that need escaping

#### Issue: "CORS errors"
**Solution:**
1. Update `FRONTEND_URL` environment variable
2. Ensure it matches your exact frontend URL (no trailing slash)
3. Redeploy backend after changing

### Frontend Issues

#### Issue: "API calls failing"
**Solution:**
1. Check `VITE_API_URL` is set correctly
2. Verify backend is deployed and healthy (`/health` endpoint)
3. Check browser console for specific errors

#### Issue: "Environment variables not working"
**Solution:**
1. Ensure variables start with `VITE_`
2. Rebuild and redeploy after changing env vars
3. Clear browser cache

---

## Deployment Checklist

Before going live:

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Backend deployed with all environment variables
- [ ] Backend health check passes
- [ ] Frontend deployed with correct API URL
- [ ] Test user registration
- [ ] Test group creation
- [ ] Test expense tracking
- [ ] Test settlement calculations
- [ ] CORS configured correctly
- [ ] Custom domains configured (if needed)
- [ ] HTTPS working on both frontend and backend
- [ ] Monitoring set up

---

## Cost Estimates

### Free Tier (Recommended for starting):
- **MongoDB Atlas:** Free M0 cluster (512MB storage, shared)
- **Railway:** $5/month credit (enough for hobby projects)
- **Render:** Free tier (spins down after 15min inactivity)
- **Vercel:** Generous free tier for both frontend and serverless
- **Netlify:** Free tier for frontend

### Paid Tier (For production):
- **MongoDB Atlas:** $9/month for M2 cluster (2GB storage, dedicated)
- **Railway:** ~$5-20/month based on usage
- **Render:** $7/month for always-on service
- **Vercel Pro:** $20/month for team features

**Total for small production app:** ~$15-30/month

---

## Support

Need help?
- Backend API docs: See `backend/README.md`
- MongoDB setup: See `backend/MONGODB_SETUP.md`
- API testing: See `backend/API_TESTING.md`
- Backend status: See `BACKEND_STATUS.md`

Happy deploying! 🚀
