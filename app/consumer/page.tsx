"use client"

import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-context"
import { useEvents } from "@/components/events-context"
import { EventCard } from "@/components/event-card"
import { ConsumerHistory } from "@/components/ticket-list"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useMemo } from "react"

export default function ConsumerDashboard() {
  const { user } = useAuth()
  const { events } = useEvents()
  const [q, setQ] = useState("")
  const [date, setDate] = useState("")

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchName = q ? e.name.toLowerCase().includes(q.toLowerCase()) : true
      const matchDate = date ? e.date === date : true
      return matchName && matchDate
    })
  }, [events, q, date])

  if (!user || user.role !== "consumer") {
    return (
      <AppShell>
        <div className="text-sm text-slate-600">Please login as Consumer.</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Browse Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="q">Search by name</Label>
              <Input id="q" placeholder="e.g., Tech, Concert..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="date">Filter by date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {filtered.length === 0 && <div className="text-sm text-slate-600">No events match your filters.</div>}
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Your Booking History</h2>
          <ConsumerHistory consumerId={user.id} />
        </section>
      </div>
    </AppShell>
  )
}
