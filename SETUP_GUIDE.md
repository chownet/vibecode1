# Step-by-Step Setup Guide

Follow these steps to deploy your Farcaster Auction Mini App.

## ✅ Step 1: Dependencies Installed
**Status: COMPLETE** ✓

All npm packages have been installed successfully.

---

## ✅ Step 2: Local Testing
**Status: COMPLETE** ✓

The app builds successfully. You can test it locally by running:
```bash
npm run dev
```
Then open http://localhost:3000 in your browser.

**Note:** The Farcaster SDK features will work better when deployed, but you can test the UI locally.

---

## 📝 Step 3: Set Up Git Repository

### Option A: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `farcaster-auction-miniapp`
3. **Don't** initialize it with a README (we already have one)

### Option B: Use Existing Repository

If you already have a Git repository, skip to Step 4.

### Initialize Git (if not already done):

```bash
cd "/Users/sarahchow/Downloads/Vibe Code app"
git init
git add .
git commit -m "Initial commit: Farcaster Auction Mini App"
```

### Connect to GitHub:

```bash
# Replace YOUR_USERNAME and YOUR_REPO with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 4: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)** and sign in (or create an account)

2. **Click "Add New Project"**

3. **Import your GitHub repository:**
   - Select your repository from the list
   - Or paste the GitHub URL

4. **Configure the project:**
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (should be auto-detected)
   - Output Directory: `dist` (should be auto-detected)

5. **Click "Deploy"**

6. **Wait for deployment** (usually takes 1-2 minutes)

7. **Copy your deployment URL** - it will look like:
   - `https://your-app-name.vercel.app`
   - Or a custom domain if you set one up

---

## 🔧 Step 5: Update Configuration Files

Once you have your Vercel URL, update these files:

### A. Update `minikit.config.ts`

Replace `https://yourdomain.com` with your actual Vercel URL:

```typescript
const ROOT_URL = process.env.VITE_ROOT_URL || 'https://your-app-name.vercel.app';
```

### B. Update `public/.well-known/farcaster.json`

Replace all instances of `https://yourdomain.com` with your Vercel URL.

### C. Commit and Push Changes

```bash
git add .
git commit -m "Update configuration with deployment URL"
git push
```

Vercel will automatically redeploy with the new configuration.

---

## 🔗 Step 6: Associate Your Farcaster Account

1. **Ensure your app is deployed and accessible** at your Vercel URL

2. **Disable Vercel Authentication** (if enabled):
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Deployment Protection**
   - Toggle **"Vercel Authentication"** to **OFF**
   - Click **Save**

3. **Go to Base Build Account Association Tool:**
   - Visit: https://base.org/build/account-association
   - Or search for "Base Build Account Association" in the Base docs

4. **Enter your app URL:**
   - Paste your Vercel URL (e.g., `https://your-app-name.vercel.app`)
   - Click **"Submit"**

5. **Verify and generate credentials:**
   - Click the **"Verify"** button
   - Follow the instructions to sign the message
   - Copy the `accountAssociation` object that appears

6. **Update `minikit.config.ts`:**
   - Paste the `accountAssociation` object into the config file
   - It should look like:
   ```typescript
   accountAssociation: {
     "header": "eyJ...",
     "payload": "eyJ...",
     "signature": "0x..."
   },
   ```

7. **Commit and push:**
   ```bash
   git add minikit.config.ts
   git commit -m "Add account association credentials"
   git push
   ```

---

## 🖼️ Step 7: Add Required Images

You need to add these images to your `public` folder:

### Required Images:
- `icon.png` - App icon (512x512px recommended)
- `splash.png` - Splash screen (1200x630px recommended)
- `hero.png` - Hero image (1200x630px recommended)
- `og-image.png` - Open Graph image for social sharing (1200x630px)
- `screenshot-portrait.png` - Portrait screenshot of your app

### Quick Options:

**Option 1: Use Placeholder Images (for testing)**
You can use a service like [Placeholder.com](https://placeholder.com) or create simple colored images.

**Option 2: Create Custom Images**
- Use tools like Figma, Canva, or Photoshop
- Make sure they match the dimensions above
- Save them in the `public` folder

**Option 3: Use AI Image Generators**
- Use DALL-E, Midjourney, or similar tools
- Generate images with auction/blockchain themes

### After Adding Images:

```bash
git add public/*.png
git commit -m "Add app images"
git push
```

---

## ✅ Step 8: Test and Publish

### A. Preview Your App

1. Go to [base.dev/preview](https://base.dev/preview)

2. **Enter your app URL** in the preview tool

3. **Test the following:**
   - ✅ **Embeds tab**: Check that your app preview looks good
   - ✅ **Account association tab**: Verify your credentials are correct
   - ✅ **Metadata tab**: Check all metadata fields are populated
   - ✅ **Launch button**: Test that your app opens correctly

### B. Fix Any Issues

If you see errors:
- Check the browser console for errors
- Verify all URLs in your config files are correct
- Make sure images are accessible at the URLs you specified
- Check that your Vercel deployment is live

### C. Publish Your App

1. **Open the Base app** (mobile or web)

2. **Create a new post** with your app URL:
   - Example: "Check out my new auction app! https://your-app-name.vercel.app"

3. **Post it!** Your app will now be discoverable in the Base app.

---

## 🎉 You're Done!

Your Farcaster Auction Mini App is now live! Users can:
- Create auctions with time limits or auto-accept prices
- Bid on active auctions
- See auctions automatically close when conditions are met

---

## 🆘 Troubleshooting

### App won't load in Base app
- Check that your Vercel deployment is live
- Verify the URL in your manifest matches your deployment URL
- Check browser console for errors

### Account association fails
- Make sure Vercel Authentication is disabled
- Verify your app is publicly accessible
- Try regenerating the association credentials

### Images not showing
- Check that image files exist in the `public` folder
- Verify image URLs in config files match your domain
- Make sure images are committed and pushed to Git

### Need Help?
- Check the [Base Mini Apps Documentation](https://docs.base.org/mini-apps)
- Visit the [Base Discord](https://discord.gg/base) for community support

