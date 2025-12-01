# Quick Update Guide

This is a simple guide for updating your deployed app.

## One-Command Update

Once your code is on GitHub and connected to Vercel:

```bash
# Make your changes, then:
git add . && git commit -m "Update: description of changes" && git push origin main
```

That's it! Vercel will automatically deploy your changes in 1-2 minutes.

## Step-by-Step Update Process

### 1. Make Your Changes

Edit any files you need to update in your code editor.

### 2. Test Locally (Optional but Recommended)

```bash
npm run dev
```

Test your changes at `http://localhost:5173`

### 3. Build Locally to Check for Errors

```bash
npm run build
```

If this succeeds, your deployment will work too!

### 4. Commit and Push

```bash
git add .
git commit -m "Your update description"
git push origin main
```

### 5. Check Deployment Status

1. Go to [vercel.com](https://vercel.com)
2. Click on your project
3. See the deployment progress in real-time
4. Your site updates automatically when deployment completes!

## Common Update Scenarios

### Update Code Only

```bash
# Edit files → commit → push
git add .
git commit -m "Fix: description"
git push origin main
```

### Update Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update the variable value
3. Click "Save"
4. Go to Deployments tab → Click "Redeploy" on latest deployment

### Update Dependencies

```bash
# Update package.json or run:
npm install package-name

# Commit the changes
git add package.json package-lock.json
git commit -m "Update: dependencies"
git push origin main
```

## Rollback (If Something Goes Wrong)

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the previous working deployment
3. Click the "..." menu → "Promote to Production"

## Tips

- ✅ Always test locally with `npm run build` before pushing
- ✅ Write clear commit messages
- ✅ Check Vercel deployment logs if build fails
- ✅ Environment variables require redeploy to take effect

## Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup
- Check Vercel dashboard for build logs and errors
- Check browser console for runtime errors

