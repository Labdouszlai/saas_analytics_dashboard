import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your environment (any standard Postgres connection string works).")
}

// A single shared pg Pool is used by both Drizzle and Better Auth.
// DATABASE_URL is a standard Postgres connection string, so this works against
// any Postgres host: local, Docker, a VPS, or any managed provider.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
