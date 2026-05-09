# 🚀 Quick Deployment Commands

## Prerequisites
- Render account: https://render.com/register
- Vercel account: https://vercel.com/signup
- GitHub repository (optional but recommended)

---

## Step 1: Push Code to GitHub (Recommended)

```bash
# Initialize git if not already done
cd /app
git init
git add .
git commit -m "Initial commit - Our Young India Platform"

# Create new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/our-young-india.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### Using Render Dashboard:
1. Go to https://dashboard.render.com/select-repo
2. Connect your GitHub repository
3. Select repository
4. Configure:
   - **Name:** `ouryoungindia-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
```
MONGO_URL=mongodb+srv://oyi_admin:g4smbDjj9DEMRmSA@cluster0.l5bwr5i.mongodb.net/ouryoungindia?retryWrites=true&w=majority
DB_NAME=ouryoungindia
JWT_SECRET=oyi-prod-jwt-secret-2026-secure-random-string
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-9C5A7B206EeDb670a7
FRONTEND_URL=https://www.ouryoungindia.in
```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Note your API URL: `https://ouryoungindia-api.onrender.com`

---

## Step 3: Update Frontend Environment Variable

Before deploying frontend, update the backend URL:

```bash
cd /app/frontend

# Edit .env.production file
echo "REACT_APP_BACKEND_URL=https://ouryoungindia-api.onrender.com" > .env.production
```

---

## Step 4: Deploy Frontend to Vercel

### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd /app/frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Choose your account)
# - Link to existing project? No
# - What's your project's name? our-young-india
# - In which directory is your code located? ./
# - Want to override settings? No

# Wait 2-3 minutes for deployment
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Root Directory:** `frontend` (if monorepo) or leave blank
   - **Framework Preset:** Vite
   - **Build Command:** `yarn build`
   - **Output Directory:** `dist`

4. Add Environment Variable:
   - Key: `REACT_APP_BACKEND_URL`
   - Value: `https://ouryoungindia-api.onrender.com`

5. Click "Deploy"
6. Wait 2-3 minutes
7. Your site is live! Note the URL: `https://your-project.vercel.app`

---

## Step 5: Update CORS in Backend

After frontend is deployed, update backend CORS:

1. Go to Render Dashboard → Your Service → Environment
2. Update `CORS_ORIGINS`:
```
https://your-project.vercel.app,https://www.ouryoungindia.in,https://ouryoungindia.in
```
3. Click "Save Changes" (auto-redeploys)

---

## Step 6: Test Your Deployment

### Test Backend:
```bash
curl https://ouryoungindia-api.onrender.com/api/health
curl https://ouryoungindia-api.onrender.com/api/stories
```

### Test Frontend:
Open in browser:
```
https://your-project.vercel.app
```

### Test Admin Panel:
```
https://your-project.vercel.app/admin/login
Email: admin@ouryoungindia.in
Password: Admin@123
```

---

## 🎯 Optional: Custom Domains

### For Frontend (Vercel):
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `www.ouryoungindia.in`
3. Add domain: `ouryoungindia.in` (redirects to www)
4. Update DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### For Backend (Render):
1. Render Dashboard → Service → Settings → Custom Domain
2. Add: `api.ouryoungindia.in`
3. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: ouryoungindia-api.onrender.com
   ```

---

## 🔄 Continuous Deployment (Automatic Updates)

Both Render and Vercel support automatic deployments:

**Render:**
- Automatically deploys on push to `main` branch
- Can disable in Settings → Build & Deploy

**Vercel:**
- Automatically deploys all branches
- Production: commits to `main`
- Preview: commits to other branches

---

## ⚡ Quick Troubleshooting

**Backend not starting?**
```bash
# Check Render logs
# Dashboard → Your Service → Logs
```

**Frontend shows blank page?**
```bash
# Check Vercel logs
# Dashboard → Your Project → Deployments → Click latest → Logs
```

**CORS errors?**
```bash
# Update CORS_ORIGINS in Render to include your Vercel URL
# Must start with https://
```

**API calls fail?**
```bash
# Check REACT_APP_BACKEND_URL in Vercel environment variables
# Redeploy frontend after changing env vars
```

---

## 📊 Deployment Status

- [x] MongoDB Atlas: ✅ Running (3 stories, 2 nominations)
- [ ] Render Backend: Pending deployment
- [ ] Vercel Frontend: Pending deployment
- [ ] Custom Domains: Optional

---

## 🎉 Success!

Once deployed, your platform will be live at:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://ouryoungindia-api.onrender.com/api`
- **Admin:** `https://your-project.vercel.app/admin/login`

**Next Steps:**
1. Test all features thoroughly
2. Update admin password
3. Add more stories through admin panel
4. Share with the world! 🌍

---

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Full Guide: See DEPLOYMENT_GUIDE.md
