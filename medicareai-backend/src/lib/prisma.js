import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

// 2. ADD THIS: Default Export (Fixes the Render SyntaxError)
