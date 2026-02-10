import { Pool } from "pg";

// Type-only import for global cache
type PgPool = import("pg").Pool;

// Prevent creating multiple pools in dev (Next.js hot reload issue)
declare global {
  // eslint-disable-next-line no-var
  var pgPool: PgPool | undefined;
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
