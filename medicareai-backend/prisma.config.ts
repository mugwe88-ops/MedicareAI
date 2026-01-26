import 'dotenv/config'; 
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use process.env with a fallback to avoid build-time crashes
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/db",
  },
});
