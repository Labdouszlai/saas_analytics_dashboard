import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { LandingNav } from "@/components/landing/landing-nav"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { Stats } from "@/components/landing/stats"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-svh bg-background">
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
