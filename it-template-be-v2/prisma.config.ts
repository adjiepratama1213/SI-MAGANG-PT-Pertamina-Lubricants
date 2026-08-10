import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Resolve template variables in DATABASE_URL
function resolveDatabaseUrl(url: string): string {
  if (!url || !url.includes('${')) {
    return url;
  }
  return url
    .replace(/\$\{DB_USER\}/g, process.env.DB_USER || '')
    .replace(/\$\{DB_PASS\}/g, process.env.DB_PASS || '')
    .replace(/\$\{DB_HOST\}/g, process.env.DB_HOST || 'localhost')
    .replace(/\$\{DB_PORT\}/g, process.env.DB_PORT || '5432')
    .replace(/\$\{DB_NAME\}/g, process.env.DB_NAME || '');
}

// Get DATABASE_URL from environment
// Try process.env first (for Kubernetes secrets), then try env() (Prisma's recommended way)
let databaseUrl: string;
if (process.env.DATABASE_URL) {
  databaseUrl = process.env.DATABASE_URL;
} else {
  try {
    databaseUrl = env('DATABASE_URL');
  } catch (error) {
    throw new Error('DATABASE_URL environment variable is required but not found');
  }
}

// Resolve template variables if present
const resolvedUrl = databaseUrl.includes('${') ? resolveDatabaseUrl(databaseUrl) : databaseUrl;

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'npx ts-node prisma/seed.ts',
  },
  datasource: {
    url: resolvedUrl,
  },
});
