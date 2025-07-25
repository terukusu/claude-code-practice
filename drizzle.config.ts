import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/persistence/drizzle/schema/*',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './data/database.sqlite',
  },
  verbose: true,
  strict: true,
} satisfies Config;