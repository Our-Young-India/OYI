# 🚀 Our Young India - Complete Deployment Guide

## Migration from Emergent to Vercel + Render + MongoDB Atlas

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [x] MongoDB Atlas cluster created and configured
- [x] Database seeded with sample data
- [x] Backend code prepared with health check endpoint
- [x] Frontend configuration files created
- [ ] Render account created
- [ ] Vercel account created
- [ ] Custom domains configured (optional)

---

## 📊 DEPLOYMENT ARCHITECTURE

```
┌─────────────────┐
│   MongoDB Atlas │
│  (Database)     │
│ ouryoungindia   │
└────────┬────────┘
         │
         │
┌────────▼───────────┐
│   Render           │
│  (Backend API)     │
│  FastAPI + Python  │
└────────┬───────────┘
         │
         │ HTTPS
┌────────▼────────────┐
│   Vercel            │
│  (Frontend)         │
│  React + Vite       │
└─────────────────────┘
```

---

## 🗄️ PART 1: MongoDB Atlas (COMPLETED ✅)

Your MongoDB Atlas database is already set up and running!

**Connection String:**
```
mongodb+srv://oyi_admin:g4smbDjj9DEMRmSA@cluster0.l5bwr5i.mongodb.net/ouryoungindia?retryWrites=true&w=majority
```

**Database:** `ouryoungindia`

**Collections:**
- `stories` (3 sample stories)
- `nominations` (2 sample nominations)
- `admins` (1 admin account)

**Admin Credentials:**
- Email: `admin@ouryoungindia.in`
- Password: `Admin@123`

---

## 🔧 PART 2: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Verify your email

### Step 2: Create New Web Service
1. Click "New +" button → "Web Service"
2. Choose "Build and deploy from a Git repository"
3. Click "Connect account" → Connect your GitHub
4. Find your repository or use "Public Git Repository" option

**If using Public Git Repository:**
- You'll need to push your code to GitHub first
- Or use Render's Git integration

### Step 3: Configure Service

**Basic Configuration:**
```
Name: ouryoungindia-api
Region: Oregon (US West) or closest to India
Branch: main
Root Directory: backend
Runtime: Python 3
```

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
uvicorn server:app --host 0.0.0.0 --port $PORT
```

### Step 4: Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://oyi_admin:g4smbDjj9DEMRmSA@cluster0.l5bwr5i.mongodb.net/ouryoungindia?retryWrites=true&w=majority` |
| `DB_NAME` | `ouryoungindia` |
| `JWT_SECRET` | `oyi-prod-jwt-secret-2026-secure-random-string` |
| `CORS_ORIGINS` | `https://www.ouryoungindia.in,https://ouryoungindia.in,https://ouryoungindia.vercel.app` |
| `EMERGENT_LLM_KEY` | `sk-emergent-9C5A7B206EeDb670a7` |
| `FRONTEND_URL` | `https://www.ouryoungindia.in` |

**IMPORTANT:** 
- For `CORS_ORIGINS`, add your Vercel URL after deployment (update this later)
- For `FRONTEND_URL`, use your final domain

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for first deployment
3. Your API will be available at: `https://ouryoungindia-api.onrender.com`

### Step 6: Test Backend
Once deployed, test your API:
```bash
curl https://ouryoungindia-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-12-XX..."
}
```

### Step 7: (Optional) Configure Custom Domain
If you want `api.ouryoungindia.in`:
1. In Render dashboard → Your service → "Settings"
2. Scroll to "Custom Domain"
3. Add: `api.ouryoungindia.in`
4. Follow DNS instructions (add CNAME record)

---

## 🎨 PART 3: Deploy Frontend to Vercel

### Step 1: Update Environment Variable
**IMPORTANT:** Before deploying, update the backend URL:

Edit `/app/frontend/.env.production`:
```bash
REACT_APP_BACKEND_URL=https://ouryoungindia-api.onrender.com
```

Or if using custom domain:
```bash
REACT_APP_BACKEND_URL=https://api.ouryoungindia.in
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Verify your email

### Step 3: Deploy Frontend
**Option A: Using Vercel CLI (Recommended)**

Install Vercel CLI:
```bash
npm install -g vercel
```

Deploy:
```bash
cd /app/frontend
vercel login
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Click "Add New Project"
2. Import your Git repository
3. Select the frontend directory
4. Configure as below

### Step 4: Project Configuration

**Framework Preset:** Vite
**Root Directory:** `frontend` (if monorepo)
**Build Command:** `yarn build`
**Output Directory:** `dist`
**Install Command:** `yarn install`

### Step 5: Add Environment Variables
In Vercel dashboard:
1. Go to Project → Settings → Environment Variables
2. Add:

| Key | Value | Environments |
|-----|-------|--------------|
| `REACT_APP_BACKEND_URL` | `https://ouryoungindia-api.onrender.com` | Production, Preview, Development |

### Step 6: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your site will be live at: `https://your-project.vercel.app`

### Step 7: Test Frontend
1. Open your Vercel URL
2. Navigate to different pages
3. Test admin login at `/admin/login`
4. Check if stories load from MongoDB Atlas

### Step 8: (Optional) Configure Custom Domain

**For www.ouryoungindia.in:**
1. In Vercel → Project Settings → Domains
2. Add: `www.ouryoungindia.in`
3. Add: `ouryoungindia.in` (redirects to www)
4. Follow DNS instructions

**DNS Configuration (Use your domain provider):**

For Vercel:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

```
Type: A
Name: @
Value: 76.76.21.21
```

---

## 🔄 PART 4: Update CORS After Deployment

Once both frontend and backend are deployed:

1. Go to Render → Your service → Environment
2. Update `CORS_ORIGINS` to include your actual Vercel URLs:
   ```
   https://www.ouryoungindia.in,https://ouryoungindia.in,https://your-project.vercel.app
   ```
3. Click "Save Changes"
4. Service will automatically redeploy

---

## 🧪 PART 5: Post-Deployment Testing

### Test Checklist:
- [ ] Homepage loads with stats and carousel
- [ ] Journeys page shows stories from MongoDB
- [ ] Journey detail page loads individual story
- [ ] YouTube video embeds work
- [ ] About page renders all 12 sections
- [ ] Nominate form submits successfully
- [ ] Admin login works
- [ ] Admin can view/edit stories
- [ ] Admin can manage nominations
- [ ] Search and filters work on Journeys page
- [ ] Mobile responsive design
- [ ] All navigation links work

### Test Admin Login:
1. Go to: `https://your-domain.com/admin/login`
2. Email: `admin@ouryoungindia.in`
3. Password: `Admin@123`

### Test API Endpoints:
```bash
# Get all stories
curl https://ouryoungindia-api.onrender.com/api/stories

# Get single story
curl https://ouryoungindia-api.onrender.com/api/stories/rohan-kumar-chess-champion

# Health check
curl https://ouryoungindia-api.onrender.com/api/health
```

---

## 🔐 PART 6: Security Checklist

After deployment:
- [ ] Change JWT_SECRET to a strong random value
- [ ] Update admin password to something more secure
- [ ] Enable Render auto-deploy only for main branch
- [ ] Set up SSL/HTTPS (automatic on Render & Vercel)
- [ ] Configure rate limiting (future)
- [ ] Set up monitoring and alerts

---

## 🚨 TROUBLESHOOTING

### Backend Issues

**Problem: Service crashes on startup**
- Check Render logs: Dashboard → Logs
- Verify all environment variables are set
- Confirm MongoDB Atlas IP whitelist includes `0.0.0.0/0`

**Problem: CORS errors**
- Update `CORS_ORIGINS` in Render environment variables
- Include all frontend URLs (with https://)
- Redeploy backend after changes

**Problem: Database connection fails**
- Check MongoDB Atlas cluster is not paused
- Verify network access allows all IPs
- Test connection string manually

### Frontend Issues

**Problem: API calls fail**
- Check `REACT_APP_BACKEND_URL` in Vercel environment variables
- Must include `https://` and `/api` prefix in code
- Rebuild after environment variable changes

**Problem: Blank page or errors**
- Check Vercel deployment logs
- Verify build completed successfully
- Check browser console for errors

**Problem: Stories don't load**
- Test backend API directly in browser
- Check network tab in browser DevTools
- Verify CORS is properly configured

---

## 📈 PART 7: Monitoring & Maintenance

### Render Monitoring:
- Free tier sleeps after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to paid tier for 24/7 uptime

### Vercel Monitoring:
- Check Analytics dashboard for traffic
- Monitor Build & Deployment logs
- Set up custom monitoring (optional)

### MongoDB Atlas:
- Monitor storage usage (512MB free tier)
- Check connection metrics
- Set up alerts for storage limits

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Share Your Platform:**
   - Test thoroughly on mobile and desktop
   - Share with friends and family
   - Collect feedback

2. **Add More Features:**
   - Photo upload for nominations (Object Storage)
   - Email integration for admin workflow
   - Comments section
   - User accounts

3. **Content Creation:**
   - Add more stories through admin panel
   - Process nominations
   - Create engaging content

4. **SEO & Marketing:**
   - Submit sitemap to Google
   - Share on social media
   - Reach out to schools and communities

---

## 📞 SUPPORT

If you encounter issues:

**Render Support:**
- https://render.com/docs
- Community Discord

**Vercel Support:**
- https://vercel.com/docs
- Community Support

**MongoDB Atlas:**
- https://www.mongodb.com/docs/atlas/
- Community Forums

---

## 🎉 CONGRATULATIONS!

Your "Our Young India" platform is now live on production infrastructure!

**Your Live URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://ouryoungindia-api.onrender.com`
- Database: MongoDB Atlas (Cloud)

**Custom Domains (after configuration):**
- Frontend: `https://www.ouryoungindia.in`
- Backend API: `https://api.ouryoungindia.in`

---

**Created:** December 2026
**Last Updated:** Deployment migration from Emergent to Vercel + Render

