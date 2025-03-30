# Vercel Size Optimization Guide

This guide explains how to deploy your Klede Waitlist application to Vercel while staying under the 3MB size limit for serverless functions.

## Why Size Optimization Matters

Vercel limits serverless functions to 3MB in compressed size. Without optimization, modern web applications with their dependencies can easily exceed this limit, causing deployment failures.

## Option 1: Automatic Optimization (Recommended)

The automatic optimization is already configured in your project:

1. **No manual steps needed!** Just deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. The `optimize-for-vercel.sh` script will be automatically executed during the build process, as configured in `vercel.json`.

## Option 2: Manual Optimization

If you need to customize the optimization or deploy a pre-built version:

1. Run the optimization script:
   ```bash
   chmod +x optimize-for-vercel.sh
   ./optimize-for-vercel.sh
   ```

2. Deploy the pre-built optimized build:
   ```bash
   vercel deploy --prebuilt
   ```

## What The Optimization Script Does

The `optimize-for-vercel.sh` script performs several optimizations:

1. **Removes unnecessary files** - Removes test files, large assets, and debugging files
2. **Minifies code** - Compresses JavaScript with advanced minification
3. **Tree-shaking** - Eliminates unused code
4. **Dependency pruning** - Keeps only production dependencies
5. **Module optimization** - Ensures CommonJS compatibility
6. **Proper file structure** - Creates the correct output for Vercel serverless functions

## Advanced: Customizing the Optimization

If you need to customize the optimization process:

1. Edit `optimize-for-vercel.sh` to include or exclude specific files
2. Add additional optimization steps like:
   - Further code compression
   - Image optimization
   - Dependency substitution

## Checking Your Function Size

After deployment, you can check your function size in the Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to "Functions"
3. Check the size of your API functions

## Troubleshooting

### Function Size Still Too Large

If you're still facing size issues:

1. Run the optimization script locally to see the output size:
   ```bash
   ./optimize-for-vercel.sh
   du -sh .vercel/output/functions/api/*
   ```

2. Identify large dependencies and consider:
   - Finding smaller alternatives
   - Using dynamic imports
   - Moving functionality to the client side

### Other Common Issues

- **Build errors**: Ensure esbuild is properly installed
- **Missing dependencies**: Check if critical dependencies are being incorrectly pruned
- **Runtime errors**: Test the optimized build locally before deploying

## Need More Help?

If you continue to face issues with size optimization:

1. Consult Vercel's documentation on [optimizing serverless functions](https://vercel.com/docs/functions/serverless-functions/runtimes#optimizing-functions)
2. Use Vercel's [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) VS Code extension to identify large dependencies
3. Consider splitting your application into smaller serverless functions