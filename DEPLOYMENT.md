# GitHub Pages Deployment Guide

## Quick Setup Instructions

### Option 1: Using GitHub Desktop (Recommended for beginners)

1. **Install GitHub Desktop**
   - Download from: https://desktop.github.com/
   - Sign in with your GitHub account

2. **Create Repository**
   - Click "Create a New Repository on your hard drive"
   - Name: `cosmic-defender` (or your preferred name)
   - Local Path: Select this folder
   - Check "Initialize this repository with a README" (uncheck since we have one)
   - Click "Create Repository"

3. **Publish to GitHub**
   - Click "Publish repository"
   - Uncheck "Keep this code private" to make it public
   - Click "Publish Repository"

4. **Enable GitHub Pages**
   - Go to your repository on GitHub.com
   - Click Settings tab
   - Scroll down to "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

5. **Your game will be live at:**
   ```
   https://yourusername.github.io/cosmic-defender/
   ```

### Option 2: Using Git Command Line

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit: Cosmic Defender game"
git branch -M main
git remote add origin https://github.com/yourusername/cosmic-defender.git
git push -u origin main

# Then enable GitHub Pages in repository settings
```

## After Deployment

- Your game will be accessible at: `https://yourusername.github.io/repository-name/`
- Updates take 1-2 minutes to deploy
- Share the link with friends to play!

## Features That Work on GitHub Pages

✅ Full game functionality
✅ All 3 levels with different themes
✅ Sound effects and music
✅ Local high score saving
✅ Responsive design
✅ Mobile-friendly controls (can be added)

## Troubleshooting

- **Game not loading?** Check browser console for errors
- **No sound?** Some browsers require user interaction before audio
- **Performance issues?** Game is optimized for modern browsers

## Sharing Your Game

Once deployed, you can:
- Share the direct URL
- Add it to your GitHub profile
- Submit to game showcases
- Get feedback from the community

## Next Steps

Consider adding:
- Mobile touch controls
- More levels or enemy types
- Leaderboard system
- Social sharing features
