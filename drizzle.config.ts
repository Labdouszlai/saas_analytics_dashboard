import "dotenv/config"
import { defineConfig } from "drizzle-kit"

// Self-hostable: all DB config comes from the standard DATABASE_URL env var,
// so `pnpm db:push` / `pnpm db:studio` work against any Postgres instance.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
