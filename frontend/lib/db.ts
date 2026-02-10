import pg from "pg";

const { Pool } = pg;

// Prevent creating multiple pools in dev (Next.js hot reload issue)
declare global {
  // eslint-disable-next-line no-var
  var pgPool: pg.Pool | undefined;
}

const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

if (process.env.NODE_ENV !== "production") global.pgPool = pool;

export { pool };
export default pool;

