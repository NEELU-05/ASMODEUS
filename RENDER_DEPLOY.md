# ASMODEUS - Render.com Deployment Guide

## 🚀 Quick Deploy to Render.com

### Prerequisites
- GitHub account
- Render.com account (free tier available)

### Step 1: Push to GitHub

```bash
cd ASMODEUS
git init
git add .
git commit -m "Initial commit - ASMODEUS CRS Simulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/asmodeus.git
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to Render.com**
   - Visit https://render.com
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `asmodeus` repository

3. **Configure Service**
   - **Name**: `asmodeus-crs-simulator`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables**
   Add these in the Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   INIT_DB=false
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be live at: `https://asmodeus-crs-simulator.onrender.com`

---

## 🗄️ Database Setup (Optional)

### Option 1: Use In-Memory Mode (Default)
The app works without a database using in-memory sessions.

### Option 2: Add MySQL Database

1. **Create MySQL Database on Render**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL" (or use external MySQL)
   - Note the connection details

2. **Add Environment Variables**
   ```
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=asmodeus
   INIT_DB=true
   ```

3. **Redeploy**
   - Render will automatically redeploy
   - Database tables will be created on first run

---

## 📝 Post-Deployment

### Test Your Deployment

Visit your Render URL and test:
```
JI1234                    # Sign in
ANDELBOM                  # Check availability
SS1Y1                     # Sell seat
NM1KUMAR/RAHUL MR        # Add passenger
AP DEL 9876543210        # Add contact
ER                        # Create PNR
FXP                       # Price
TTP                       # Ticket
```

### Monitor Logs

In Render Dashboard:
- Go to your service
- Click "Logs" tab
- Monitor for any errors

---

## 🔧 Troubleshooting

### Build Fails
- Check Node version (should be >=18)
- Verify all dependencies in package.json
- Check build logs in Render dashboard

### App Crashes
- Check environment variables
- Review logs for errors
- Ensure PORT is set to 10000

### Database Connection Issues
- Verify DB credentials
- Check DB_HOST is accessible
- Set INIT_DB=false if not using DB

---

## 🌐 Custom Domain (Optional)

1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

---

## 📊 Performance

### Free Tier Limits
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

### Upgrade to Paid (Optional)
- Always-on service
- Faster performance
- More resources
- Starting at $7/month

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Render will:
1. Detect the push
2. Run build command
3. Deploy new version
4. Zero-downtime deployment

---

## 📱 Share Your App

Your ASMODEUS simulator will be live at:
```
https://asmodeus-crs-simulator.onrender.com
```

Share this URL with:
- Trainees
- Students
- Team members
- Anyone learning Amadeus

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible via URL
- [ ] Test basic booking flow
- [ ] Monitor logs for errors
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Database connected

---

## 🎉 You're Live!

Your ASMODEUS Amadeus CRS Training Simulator is now:
- ✅ Deployed to the cloud
- ✅ Accessible worldwide
- ✅ Auto-deploying on updates
- ✅ Ready for training

**Share the URL and start training!** 🎓✈️

---

## 📞 Support

For issues:
1. Check Render logs
2. Review this guide
3. Check GitHub repository
4. Contact Render support

---

*ASMODEUS - Amadeus Selling Platform Simulator*
*Deployed with ❤️ on Render.com*
