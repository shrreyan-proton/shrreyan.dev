# Deploying to GitHub - shrreyan.dev

This guide will help you push your project files to your GitHub repository.

## Prerequisites

- GitHub integration is already connected to your Replit project
- You have access to the `shrreyan.dev` repository on GitHub

## Method 1: Using Replit Git Interface (Recommended)

### Step 1: Open Git Pane
1. Look for the **Source Control** icon in the left sidebar of Replit
2. It looks like a branching diagram or network icon
3. Click on it to open the Git pane

### Step 2: Configure Remote Repository
1. In the Git pane, look for repository settings or remote configuration
2. Add your GitHub repository URL:
   ```
   https://github.com/YOUR_USERNAME/shrreyan.dev
   ```
   Replace `YOUR_USERNAME` with your actual GitHub username

3. If you're asked to set the branch, use `main` or `master` depending on your repository's default branch

### Step 3: Stage Your Files
1. You'll see a list of all changed files in your project
2. Click the **"+"** button next to each file to stage it
3. Or click **"Stage All Changes"** to stage everything at once

### Step 4: Commit Your Changes
1. Enter a commit message in the text box (e.g., "Initial deployment" or "Deploy to shrreyan.dev")
2. Click the **Commit** button
3. This saves your changes locally

### Step 5: Push to GitHub
1. Click the **Push** button (usually has an up arrow icon)
2. Your code will be uploaded to the `shrreyan.dev` repository
3. You should see a success message once complete

## Method 2: Using Shell Commands

If you prefer using the command line:

### Step 1: Open Shell
Open the Shell tab in Replit

### Step 2: Configure Git Remote
```bash
# Add your GitHub repository as remote (if not already added)
git remote add origin https://github.com/YOUR_USERNAME/shrreyan.dev.git

# Or update existing remote
git remote set-url origin https://github.com/YOUR_USERNAME/shrreyan.dev.git
```

### Step 3: Stage, Commit, and Push
```bash
# Stage all files
git add .

# Commit with a message
git commit -m "Deploy project to shrreyan.dev"

# Push to GitHub
git push -u origin main
```

Note: Replace `main` with `master` if your repository uses the master branch.

## Troubleshooting

### Authentication Issues
- Your GitHub authentication is already set up through the Replit integration
- If you encounter issues, try reconnecting the GitHub integration

### Branch Issues
- Make sure you're pushing to the correct branch (main or master)
- Check your repository's default branch on GitHub

### Merge Conflicts
- If you get merge conflicts, you may need to pull changes first:
  ```bash
  git pull origin main
  ```
- Resolve any conflicts, then commit and push again

## Verifying the Push

After pushing, verify your code on GitHub:
1. Go to `https://github.com/YOUR_USERNAME/shrreyan.dev`
2. Check that your files are visible in the repository
3. Verify the latest commit matches what you just pushed

## Next Steps

After your code is on GitHub:
- Set up GitHub Pages if you want to host the site directly from GitHub
- Configure custom domain settings to point shrreyan.dev to your hosting
- Set up CI/CD pipelines for automatic deployments

---

**Need Help?**
If you encounter any issues, check the Replit Git documentation or the error messages in the Git pane/Shell for specific guidance.
