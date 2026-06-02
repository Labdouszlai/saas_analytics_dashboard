import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import { user, session, account, verification } from "@/lib/db/schema"
import { seedUserData } from "@/lib/db/seed"

// Resolve the base URL in a host-agnostic way so the app is fully self-hostable.
// Set BETTER_AUTH_URL in your environment (e.g. https://analytics.example.com).
// The remaining fallbacks only apply to managed preview environments and are
// optional — a plain VPS / Docker deploy just needs BETTER_AUTH_URL.
const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL)

export const auth = betterAuth({
  // Use the Drizzle adapter so better-auth routes through @better-auth/drizzle-adapter
  // instead of @better-auth/kysely-adapter.  The kysely adapter ships dialect files
  // (bun-sqlite-dialect-*.mjs, d1-sqlite-dialect-*.mjs, node-sqlite-dialect.mjs)
  // that import DEFAULT_MIGRATION_TABLE and DEFAULT_MIGRATION_LOCK_TABLE from
  // kysely — constants that are internal and never exported from the kysely
  // public API.  Switching to drizzleAdapter avoids that code path entirely.
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  baseURL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  trustedOrigins: [
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    // Local development / self-hosting on localhost.
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  databaseHooks: {
    user: {
      create: {
        // After a new user is created, seed a realistic per-user demo dataset
        // so the dashboard is never empty on first login.
        after: async (newUser) => {
          try {
            await seedUserData(newUser.id)
          } catch (err) {
            console.error("[v0] Failed to seed demo data for new user:", err)
          }
        },
      },
    },
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // In dev (v0 preview iframe), force cross-site cookies so the
          // session cookie is stored by the browser.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
