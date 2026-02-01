import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// 1. Setup Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function reconcileData() {
  console.log('--- Starting Reconciliation ---');
  
  // Use a single client for transactions if you want "all or nothing" updates
  const client = await pool.connect();

  try {
    // 2. Fetch data from your database (replaces prisma.user.findMany())
    const dbResult = await client.query('SELECT id, email, status FROM "User"');
    const dbUsers = dbResult.rows;

    // 3. (Optional) Fetch external data to compare against
    // const externalData = await fetch('https://api.external.com/data');

    await client.query('BEGIN'); // Start transaction

    for (const user of dbUsers) {
      // Logic example: If condition met, update status
      const newStatus = 'verified'; 

      if (user.status !== newStatus) {
        console.log(`Updating user ${user.id}...`);

        // 4. Update the record (replaces prisma.user.update())
        await client.query(
          'UPDATE "User" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
          [newStatus, user.id]
        );
      }
    }

    await client.query('COMMIT'); // Save changes
    console.log('✅ Reconciliation successful');

  } catch (error) {
    await client.query('ROLLBACK'); // Undo changes if there's an error
    console.error('❌ Reconciliation failed:', error);
  } finally {
    client.release(); // Important: Always release the client back to the pool
  }
}

// Run the function
reconcileData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));