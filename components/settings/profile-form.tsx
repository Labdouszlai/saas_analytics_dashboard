"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.")
      return
    }
    setSaving(true)
    const { error } = await authClient.updateUser({ name: name.trim() })
    setSaving(false)
    if (error) {
      toast.error(error.message ?? "Could not update profile.")
      return
    }
    toast.success("Profile updated.")
    router.refresh()
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name. This appears across the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
            <p className="text-xs text-muted-foreground">
              Email changes are managed under Account security below.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit" disabled={saving || name.trim() === initialName}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
