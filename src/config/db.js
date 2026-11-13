import pg from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('Configure DATABASE_URL no .env do backend.')
}

export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
