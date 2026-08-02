/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "@better-auth/kysely-adapter",
    "kysely",
    "@neondatabase/serverless",
  ],
}

export default nextConfig
