# 🚀 ASMODEUS - Render.com Deployment Checklist

## ✅ Pre-Deployment Checklist

### Files Created
- [x] `package.json` (root) - Deployment scripts
- [x] `render.yaml` - Render configuration
- [x] `.gitignore` - Git ignore rules
- [x] `RENDER_DEPLOY.md` - Deployment guide
- [x] Server configured for production
- [x] ES modules configured
- [x] Static file serving enabled

### Code Ready
- [x] All TypeScript compiles
- [x] No build errors
- [x] Environment variables documented
- [x] Health check endpoint added
- [x] Production-ready server

---

## 📋 Deployment Steps

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Test Build Locally
```bash
npm run build
```

### 3. Test Production Server
```bash
npm start
# Visit http://localhost:3000
```

### 4. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit - ASMODEUS CRS Simulator"
```

### 5. Create GitHub Repository
1. Go to https://github.com/new
2. Create repository named `asmodeus`
3. Don't initialize with README (we have one)

### 6. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/asmodeus.git
git branch -M main
git push -u origin main
```

### 7. Deploy on Render
1. Visit https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select your `asmodeus` repository
5. Configure:
   - **Name**: `asmodeus-crs-simulator`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   INIT_DB=false
   ```
7. Click "Create Web Service"

### 8. Wait for Deployment
- Initial deployment: 5-10 minutes
- Monitor logs in Render dashboard
- Wait for "Live" status

### 9. Test Deployed App
Visit: `https://asmodeus-crs-simulator.onrender.com`

Test commands:
```
JI1234
ANDELBOM
SS1Y1
NM1KUMAR/RAHUL MR
AP DEL 9876543210
ER
FXP
TTP
```

---

## 🔧 Configuration Details

### Environment Variables
```
NODE_ENV=production          # Production mode
PORT=10000                   # Render default port
INIT_DB=false               # No database (in-memory mode)
```

### Optional Database Variables
If using MySQL:
```
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=asmodeus
INIT_DB=true
```

---

## 📊 Post-Deployment

### Verify Deployment
- [ ] App loads at Render URL
- [ ] Terminal interface visible
- [ ] Scenarios panel shows 20 scenarios
- [ ] Sign in works (JI1234)
- [ ] Availability search works
- [ ] Booking flow completes
- [ ] No console errors

### Monitor
- [ ] Check Render logs for errors
- [ ] Test all major commands
- [ ] Verify performance
- [ ] Check memory usage

### Share
- [ ] Copy Render URL
- [ ] Share with team/trainees
- [ ] Add to documentation
- [ ] Update README with live link

---

## 🔄 Auto-Deploy Setup

Render automatically deploys on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect push
2. Run build
3. Deploy automatically
4. Zero downtime

---

## 🌐 Custom Domain (Optional)

1. Go to Render service settings
2. Click "Custom Domains"
3. Add your domain (e.g., `asmodeus.yourdomain.com`)
4. Update DNS:
   ```
   Type: CNAME
   Name: asmodeus
   Value: asmodeus-crs-simulator.onrender.com
   ```
5. Wait for DNS propagation (5-30 minutes)

---

## 📈 Monitoring

### Render Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, requests
- **Events**: Deployments, restarts
- **Settings**: Environment, scaling

### Health Check
Visit: `https://your-app.onrender.com/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-14T10:00:00.000Z"
}
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Test locally first
npm run build

# Check logs in Render
# Verify Node version >=18
# Check package.json scripts
```

### App Won't Start
```bash
# Check environment variables
# Verify PORT=10000
# Review start command
# Check server logs
```

### 404 Errors
```bash
# Verify client build exists
# Check static file serving
# Ensure index.html in client/dist
```

### Slow First Load
- Normal on free tier
- App spins down after 15 min inactivity
- First request takes ~30 seconds
- Upgrade to paid plan for always-on

---

## 💰 Cost

### Free Tier
- ✅ 750 hours/month
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ⚠️ Spins down after 15 min
- ⚠️ Slower cold starts

### Paid Tier ($7/month)
- ✅ Always-on
- ✅ Faster performance
- ✅ More resources
- ✅ Better for production

---

## ✅ Final Checklist

Before going live:
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible
- [ ] All commands tested
- [ ] Logs checked
- [ ] URL shared

---

## 🎉 You're Live!

Your ASMODEUS simulator is now:
- ✅ Deployed to cloud
- ✅ Accessible worldwide
- ✅ Auto-deploying
- ✅ Production-ready

**Share the URL and start training!** 🎓✈️

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **GitHub**: Your repository
- **Logs**: Render dashboard
- **Health**: `/api/health` endpoint

---

*ASMODEUS - Amadeus Selling Platform Simulator*
*Ready for deployment on Render.com*
