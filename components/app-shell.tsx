"use client"

import type React from "react"

import Link from "next/link"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-dvh bg-background text-foreground font-sans">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold text-blue-600 text-balance">
            EMS — Event Management System
          </Link>
          <nav className="flex items-center gap-3">
            {user?.role === "organizer" && (
              <Link href="/organizer" className="text-sm text-slate-700 hover:underline">
                Organizer Dashboard
              </Link>
            )}
            {user?.role === "consumer" && (
              <Link href="/consumer" className="text-sm text-slate-700 hover:underline">
                Consumer Dashboard
              </Link>
            )}
            {user ? (
              <Button variant="outline" onClick={logout} aria-label="Logout">
                Logout
              </Button>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <footer className="border-t text-center text-xs text-slate-500 py-4">
        Demo: Frontend-only with localStorage. Primary: blue; Accents: green/red; Neutrals: white/slate.
      </footer>
    </div>
  )
}
