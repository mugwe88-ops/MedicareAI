import { defineConfig } from "prisma/config";

export default defineConfig({
  client: {
    engineType: "binary",
  },
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

