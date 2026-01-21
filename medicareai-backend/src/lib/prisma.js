import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js'; 
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global;

// 1. Keep the Named Export (useful for { prisma } imports)
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 2. ADD THIS: Default Export (Fixes the Render SyntaxError)
export default prisma;