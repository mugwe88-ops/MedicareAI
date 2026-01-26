import 'dotenv/config'; 
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // This allows the CLI to find your DB
    url: env("DATABASE_URL"), 
  },
});
