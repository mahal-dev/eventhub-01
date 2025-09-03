"use client"

import type React from "react"
import { createContext, useContext, useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type Role = "organizer" | "consumer"

export type User = {
  id: string
  role: Role
  name: string
  email?: string
}

type AuthContextType = {
  user: User | null
  loginAs(role: Role, name?: string): void
  logout(): void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>("ems_current_user", null)

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loginAs(role, name) {
        const defaults =
          role === "organizer"
            ? { name: "Alice Organizer", email: "alice@ems.local" }
            : { name: "Bob Consumer", email: "bob@ems.local" }
        setUser({
          id: role === "organizer" ? "org_alice" : "con_bob",
          role,
          name: name?.trim() || defaults.name,
          email: defaults.email,
        })
      },
      logout() {
        setUser(null)
      },
    }),
    [user, setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
