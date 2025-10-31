# GitHub Pages Deployment Guide

This project is configured to deploy to GitHub Pages at `ridwansharkar.github.io/Fretboard-Explorer`.

## Setup Steps

### 1. Push the Configuration to GitHub

First, commit and push the new deployment configuration:

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin master
```

### 2. Configure GitHub Repository Settings

You need to set up the repository to use GitHub Pages:

1. Go to your repository: `https://github.com/RidwanSharkar/Fretboard-Explorer`
2. Click on **Settings** tab
3. In the left sidebar, click on **Pages**
4. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
5. Save the changes

### 3. Trigger the Deployment

The deployment will automatically trigger when you push to the `master` branch. You can also:

- Manually trigger it from the **Actions** tab in your GitHub repository
- Click on **Deploy to GitHub Pages** workflow
- Click **Run workflow**

### 4. Access Your Site

Once deployed, your site will be available at:
```
https://ridwansharkar.github.io/Fretboard-Explorer
```

Note: The first deployment might take a few minutes. You can monitor the progress in the **Actions** tab.

## Configuration Details

### Changes Made:

1. **vite.config.ts**: Added `base: '/Fretboard-Explorer/'` to ensure all assets load correctly from the subdirectory
2. **.github/workflows/deploy.yml**: Created GitHub Actions workflow for automatic deployment
3. **public/.nojekyll**: Added to prevent GitHub from processing the site with Jekyll

## Local Testing

To test the build locally with the correct base path:

```bash
npm run build
npm run preview
```

Then navigate to `http://localhost:4173/Fretboard-Explorer/` in your browser.

## Troubleshooting

- **Assets not loading**: Make sure the `base` path in `vite.config.ts` matches your GitHub Pages URL structure
- **404 errors**: Ensure the GitHub Actions workflow completed successfully in the Actions tab
- **Permissions errors**: Make sure the repository has the correct permissions set in Settings > Actions > General > Workflow permissions (should be "Read and write permissions")

