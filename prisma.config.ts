import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection on Neon.
    // Falls back to DATABASE_URL when DIRECT_URL isn't set.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
