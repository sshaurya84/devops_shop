import pg from 'pg';

const { Pool } = pg;

// The Pool opens connections only when a query is made. This lets the API start
// before PostgreSQL is available, which is useful during local development.
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export async function databaseReady() {
  if (!pool) return false;

  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

