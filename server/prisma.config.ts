import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrations) needs a direct connection; Neon's pooled URL is only for the app.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
