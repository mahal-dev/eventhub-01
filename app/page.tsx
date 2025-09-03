"use client"

import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"

export default function Page() {
  const { user, loginAs } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")

  useEffect(() => {
    if (user?.role === "organizer") router.replace("/organizer")
    if (user?.role === "consumer") router.replace("/consumer")
  }, [user, router])

  return (
    <AppShell>
      <div className="grid gap-6 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Welcome to EMS</CardTitle>
            <CardDescription>Simulated role-based login. Choose a role to continue.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name (optional)</Label>
              <Input id="name" placeholder="Your display name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => loginAs("organizer", name || undefined)}>
                Login as Organizer
              </Button>
              <Button variant="outline" onClick={() => loginAs("consumer", name || undefined)}>
                Login as Consumer
              </Button>
            </div>
            <p className="text-xs text-slate-600">
              No real authentication. This is a frontend-only simulation using localStorage.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
