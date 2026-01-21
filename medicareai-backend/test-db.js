import { prisma } from './src/lib/prisma.js';

async function test() {
  const count = await prisma.doctor.count();
  console.log(`Successfully connected! Found ${count} doctors in the database.`);
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });