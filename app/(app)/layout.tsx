import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { BarChart3 } from "lucide-react"
import { auth } from "@/lib/auth"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { Topbar } from "@/components/layout/topbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const { name, email } = session.user

  return (
    <div className="min-h-svh bg-muted/20">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">Pulse</span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <SidebarNav />
          </div>
          <div className="border-t border-sidebar-border px-6 py-4">
            <p className="text-xs text-muted-foreground">Self-hosted analytics</p>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-h-svh flex-1 flex-col md:pl-64">
          <Topbar name={name ?? ""} email={email} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
