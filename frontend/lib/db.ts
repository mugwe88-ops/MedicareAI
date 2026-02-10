import { Pool } from "pg";

// Prevent creating multiple pools in dev (Next.js hot reload issue)
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
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

// Export BOTH default and named (so imports never break)
export { pool };
export default pool;
