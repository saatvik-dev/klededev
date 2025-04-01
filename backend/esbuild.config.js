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
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  outbase: '.',
  outdir: 'dist'
};

// Build all files in one go
await build({
  ...commonOptions,
  entryPoints: [
    'api/index.ts',
    'server/index.ts',
    'server/db.ts',
    'shared/schema.ts'
  ],
  outdir: 'dist',
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);"
  }
}); 