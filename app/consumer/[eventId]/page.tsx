"use client"

import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-context"
import { useEvents } from "@/components/events-context"
import { SeatGrid } from "@/components/seat-grid"
import { Button } from "@/components/ui/button"

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>()
  const { user } = useAuth()
  const { events } = useEvents()
  const router = useRouter()

  if (!user || user.role !== "consumer") {
    return (
      <AppShell>
        <div className="text-sm text-slate-600">Please login as Consumer.</div>
      </AppShell>
    )
  }

  const event = events.find((e) => e.id === params.eventId)

  if (!event) {
    return (
      <AppShell>
        <div className="grid gap-3">
          <div className="text-sm text-slate-600">Event not found.</div>
          <Button variant="outline" onClick={() => router.push("/consumer")}>
            Back to Events
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold text-balance">{event.name}</h1>
          <div className="text-sm text-slate-700">
            {event.date} at {event.time} • {event.venue}
          </div>
          {event.description ? <p className="text-sm text-slate-700">{event.description}</p> : null}
        </div>
        <SeatGrid eventId={event.id} />
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => router.push("/consumer")}>
            Back to Events
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
