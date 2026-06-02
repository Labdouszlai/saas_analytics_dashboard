import Link from "next/link"
import { BarChart3 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight text-foreground">Pulse</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Pulse Analytics. Self-hosted with care.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Log in
          </Link>
          <Link href="/sign-up" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Start free
          </Link>
        </div>
      </div>
    </footer>
  )
}
