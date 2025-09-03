"use client"

import type React from "react"

import { AuthProvider } from "@/components/auth-context"
import { EventsProvider } from "@/components/events-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventsProvider>{children}</EventsProvider>
    </AuthProvider>
  )
}
