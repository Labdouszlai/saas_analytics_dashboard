import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/layout/page-header"
import { ProfileForm } from "@/components/settings/profile-form"
import { PasswordForm } from "@/components/settings/password-form"
import { ThemePreference } from "@/components/settings/theme-preference"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your profile, security, and appearance." />
      <div className="flex max-w-2xl flex-col gap-6">
        <ProfileForm initialName={session.user.name ?? ""} email={session.user.email} />
        <PasswordForm />
        <ThemePreference />
      </div>
    </div>
  )
}
