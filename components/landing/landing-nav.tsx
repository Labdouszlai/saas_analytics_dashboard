import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">Pulse</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#stats" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Why Pulse
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
