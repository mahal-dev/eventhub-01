"use client"

import { AppShell } from "@/components/app-shell"
import { EventForm } from "@/components/event-form"
import { useAuth } from "@/components/auth-context"
import { useEvents } from "@/components/events-context"
import { OrganizerTicketList } from "@/components/ticket-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const { events } = useEvents()

  if (!user || user.role !== "organizer") {
    return (
      <AppShell>
        <div className="text-sm text-slate-600">Please login as Organizer.</div>
      </AppShell>
    )
  }

  const myEvents = events.filter((e) => e.organizerId === user.id)

  return (
    <AppShell>
      <div className="grid gap-6">
        <EventForm />
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Your Events</h2>
          {myEvents.length === 0 ? (
            <div className="text-sm text-slate-600">No events yet. Create one above.</div>
          ) : (
            <div className="grid gap-6">
              {myEvents.map((ev) => (
                <Card key={ev.id}>
                  <CardHeader>
                    <CardTitle className="text-pretty">
                      {ev.name} — {ev.date} {ev.time} @ {ev.venue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="text-sm text-slate-700">
                      Categories: {ev.categories.map((c) => `${c.name} ($${c.price}, ${c.capacity})`).join(", ")}
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-medium">Tickets Sold</h3>
                      <OrganizerTicketList eventId={ev.id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
