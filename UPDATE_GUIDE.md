# Quick Update Guide

This guide shows you how to easily update your deployed Expense Tracker app.

## 🚀 Method 1: Automatic Updates (Recommended)

Once your app is connected to GitHub and Vercel, updates are automatic:

### Steps:
1. **Make your changes** in your code editor
2. **Test locally** (optional but recommended):
   ```bash
   npm run dev
   ```
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```
4. **Done!** Vercel automatically:
   - Detects the push
   - Builds your app
   - Deploys to production
   - Takes 1-2 minutes

### Check Deployment Status:
- Go to [vercel.com](https://vercel.com) → Your Project → **Deployments**
- You'll see the build progress in real-time
- Green checkmark = deployed successfully ✅

## 🔧 Method 2: Manual Deployment

If you prefer manual control or don't use GitHub:

1. **Make your changes**
2. **Build locally**:
   ```bash
   npm run build
   ```
3. **Deploy**:
   ```bash
   vercel --prod
   ```

Or use the quick deploy script:
```bash
./QUICK_DEPLOY.sh
```

## 📝 Common Update Scenarios

### Updating Code/Features
```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push

# 4. Wait for Vercel to deploy (automatic)
```

### Updating Environment Variables
1. Go to Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Edit the variable
3. Click **Save**
4. Go to **Deployments** → Click **"..."** → **"Redeploy"**

Or via CLI:
```bash
vercel env rm VITE_APPWRITE_ENDPOINT production
vercel env add VITE_APPWRITE_ENDPOINT production
# Enter your new value when prompted
vercel --prod
```

### Updating Dependencies
```bash
# Update package.json dependencies
npm install package-name@latest

# Or update all
npm update

# Commit and push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Fixing Bugs
```bash
# 1. Fix the bug locally
# 2. Test it
npm run dev

# 3. Commit and push
git add .
git commit -m "Fix: description of bug fix"
git push

# 4. Vercel automatically redeploys
```

## 🔍 Verifying Updates

After deployment:

1. **Check Vercel Dashboard**:
   - Latest deployment should show "Ready" ✅
   - Check build logs for any errors

2. **Test Your App**:
   - Visit your Vercel URL
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to clear cache
   - Test the updated feature

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for any errors
   - Check network tab for API calls

## ⚡ Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel (first time)
vercel

# Deploy to production
vercel --prod

# View all deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Open Vercel dashboard
vercel open
```

## 🐛 Troubleshooting Updates

### Changes not showing?
- **Clear browser cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- **Wait a few minutes**: CDN might need time to update
- **Check deployment**: Make sure latest deployment succeeded

### Build fails?
- **Check build logs** in Vercel dashboard
- **Test locally**: Run `npm run build` to see errors
- **Check environment variables**: Make sure all are set correctly

### App breaks after update?
- **Check browser console** for errors
- **Revert deployment**: In Vercel → Deployments → Click previous deployment → "Promote to Production"
- **Fix and redeploy**: Make fixes, commit, push again

## 📱 Mobile Testing

After deploying:
1. Open your app on mobile device
2. Test all features
3. Check mobile responsiveness
4. Test on different screen sizes

## 💡 Pro Tips

1. **Use Preview Deployments**: Every PR gets a preview URL - test before merging
2. **Check Build Logs**: Always review build logs for warnings
3. **Test Locally First**: Run `npm run build` before pushing
4. **Use Meaningful Commits**: Clear commit messages help track changes
5. **Monitor Deployments**: Set up Vercel notifications for deployment status

## 🎯 Typical Workflow

```bash
# Daily workflow:
1. Make changes
2. npm run dev          # Test locally
3. git add .
4. git commit -m "..."  # Clear message
5. git push             # Auto-deploys!
6. Check Vercel dashboard
7. Test live site
```

That's it! Your updates are live in 1-2 minutes! 🚀

