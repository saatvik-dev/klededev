import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Common build options
const commonOptions = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  external: [
    'express',
    'cors',
    'dotenv',
    'pg',
    'drizzle-orm',
    'zod',
    'passport',
    'express-session',
    'nodemailer',
    'ws',
    'serverless-http'
  ],
  sourcemap: true,
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  outbase: '.',
  outdir: 'dist',
  loader: {
    '.ts': 'ts'
  }
};

// Build everything in one step to maintain proper module resolution
await build({
  ...commonOptions,
  entryPoints: ['api/index.ts'],
  outdir: 'dist',
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);"
  }
}); 