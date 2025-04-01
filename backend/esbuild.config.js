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
  alias: {
    '@shared': path.resolve(__dirname, '../shared')
  },
  sourcemap: true,
  minify: true
};

// Build main server
await build({
  ...commonOptions,
  entryPoints: ['server/index.ts'],
  outdir: 'dist',
});

// Build serverless function
await build({
  ...commonOptions,
  entryPoints: ['api/index.ts'],
  outdir: 'dist/api',
}); 