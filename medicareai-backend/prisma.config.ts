import "dotenv/config"; 
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  // Move the extensions here if you are using the 'prisma-client' provider
  // However, with 'prisma-client-js', these are often handled automatically
  generator: {
    client: {
      provider: "prisma-client-js",
      output: "src/generated/prisma",
    },
  },
});