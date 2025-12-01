# Deployment Guide

This guide will help you deploy your Expense Tracker to Vercel and set up easy updates.

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Expense Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click **"Add New..."** → **"Project"**
   - Click **"Import Git Repository"**
   - Select your repository
   - Click **"Import"**

3. **Configure Environment Variables**
   - In the project settings, go to **Settings** → **Environment Variables**
   - Add these three variables:
     ```
     VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
     VITE_APPWRITE_PROJECT_ID=your_project_id_here
     VITE_APPWRITE_DATABASE_ID=your_database_id_here
     ```
   - Replace with your actual values from Appwrite
   - Make sure to add them for **Production**, **Preview**, and **Development**

4. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/vishrudhrajrs/Desktop/Projects/DadExpenseTracker
   vercel
   ```
   - Follow the prompts
   - When asked about environment variables, add them:
     - `VITE_APPWRITE_ENDPOINT`
     - `VITE_APPWRITE_PROJECT_ID`
     - `VITE_APPWRITE_DATABASE_ID`

4. **For production deployment**
   ```bash
   vercel --prod
   ```

## Easy Updates Workflow

### Method 1: Automatic Deployment (Recommended)

Once connected to GitHub, every push to `main` branch automatically deploys:

1. **Make your changes locally**
2. **Commit and push**
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. **Vercel automatically builds and deploys** (takes 1-2 minutes)
4. **Your changes are live!**

### Method 2: Manual Deployment

If you prefer manual control:

1. **Make your changes locally**
2. **Test locally**
   ```bash
   npm run dev
   ```
3. **Build for production**
   ```bash
   npm run build
   ```
4. **Deploy**
   ```bash
   vercel --prod
   ```

## Updating Environment Variables

If you need to update environment variables:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Edit the variable value
3. Click **Save**
4. Redeploy:
   - Go to **Deployments** tab
   - Click the **"..."** menu on latest deployment
   - Click **"Redeploy"**

Or via CLI:
```bash
vercel env add VITE_APPWRITE_ENDPOINT
vercel env add VITE_APPWRITE_PROJECT_ID
vercel env add VITE_APPWRITE_DATABASE_ID
vercel --prod
```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel handles SSL certificates automatically

## Troubleshooting

### Build fails
- Check that all environment variables are set
- Check build logs in Vercel dashboard
- Try building locally: `npm run build`

### App doesn't work after deployment
- Verify environment variables are correct
- Check browser console for errors
- Make sure Appwrite CORS settings allow your Vercel domain

### Updates not showing
- Clear browser cache (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
- Check Vercel deployment status
- Wait a few minutes for CDN to update

## Vercel Free Tier

- **Unlimited deployments**
- **100GB bandwidth/month**
- **Automatic HTTPS**
- **Custom domains**
- **Preview deployments for every PR**

Perfect for this project!

## Quick Reference

```bash
# Local development
npm run dev

# Build locally
npm run build

# Preview production build
npm run preview

# Deploy to Vercel (first time)
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs
```
