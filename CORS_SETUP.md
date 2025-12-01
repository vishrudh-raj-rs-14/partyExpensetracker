# Fixing "Failed to Fetch" Error on Vercel

If you're getting "Failed to fetch" errors on your deployed Vercel app, this is almost always a **CORS (Cross-Origin Resource Sharing)** issue.

## Quick Fix: Add Your Vercel Domain to Appwrite

### Step 1: Get Your Vercel Domain

After deploying to Vercel, you'll get a URL like:
- `https://your-project.vercel.app`

### Step 2: Add Platform in Appwrite

1. Go to your **Appwrite Console**: https://cloud.appwrite.io (or your self-hosted URL)
2. Open your project
3. Go to **Settings** → **Platforms** (or **Web**)
4. Click **"Add Platform"** or **"Create Platform"**
5. Select **"Web App"** or **"Web"**
6. Enter your Vercel domain:
   ```
   https://your-project.vercel.app
   ```
7. Click **"Save"** or **"Create"**

### Step 3: Add Wildcard (Optional but Recommended)

For preview deployments, also add:
```
https://*.vercel.app
```

This allows all Vercel preview deployments to work.

### Step 4: Verify

1. Go back to your Vercel app
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Try signing up again
4. Should work now! ✅

## Common Issues

### Still getting "Failed to fetch"?

1. **Check the exact domain**: Make sure it matches exactly (including `https://`)
2. **Wait a few minutes**: CORS changes can take a moment to propagate
3. **Clear browser cache**: Hard refresh the page
4. **Check browser console**: Look for specific CORS error messages

### Multiple Domains?

If you have:
- Production: `https://your-app.vercel.app`
- Custom domain: `https://yourdomain.com`

Add **both** as separate platforms in Appwrite.

### Preview Deployments?

For Vercel preview deployments (PR previews), you can either:
- Add `https://*.vercel.app` (allows all previews)
- Or add each preview URL individually

## Testing CORS

After adding the platform:

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to sign up
4. Look for the request to Appwrite
5. Check the response headers - should see CORS headers if working

## Alternative: Disable CORS (Not Recommended)

If you're self-hosting Appwrite, you can disable CORS checks, but this is **not secure** and not recommended for production.

## Still Having Issues?

1. **Check Appwrite logs**: Go to Appwrite Console → Logs
2. **Verify endpoint**: Make sure `VITE_APPWRITE_ENDPOINT` is correct
3. **Check network tab**: See the exact error in browser DevTools
4. **Test locally**: Does it work on `localhost`? If yes, it's definitely CORS.

