/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // @better-auth/kysely-adapter is a transitive dependency of better-auth that
  // ships dialect bundles (bun-sqlite, d1-sqlite, node-sqlite) which import
  // DEFAULT_MIGRATION_TABLE and DEFAULT_MIGRATION_LOCK_TABLE from kysely.
  // Those constants are internal to kysely and are never exported from its
  // public API, so any bundler that statically walks the import graph fails.
  //
  // We use drizzleAdapter in lib/auth.ts, so the kysely adapter is never
  // executed at runtime — but without this list the Next.js bundler (webpack
  // or turbopack) still traverses its imports and throws:
  //   "Export DEFAULT_MIGRATION_TABLE doesn't exist in target module"
  //
  // Marking these packages as server-external tells Next.js to leave them as
  // native Node.js requires rather than bundling them, which sidesteps the
  // broken named-export entirely.
  serverExternalPackages: [
    "@better-auth/kysely-adapter",
    "kysely",
  ],
}

export default nextConfig
