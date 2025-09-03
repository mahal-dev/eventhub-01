"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { useEvents, type Ticket, type Event } from "./events-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { drawQr } from "@/lib/qr"
import { downloadTicketPdf, buildTicketPayload } from "@/lib/ticket-pdf"

export function OrganizerTicketList({ eventId }: { eventId: string }) {
  const { getEventTickets } = useEvents()
  const tickets = getEventTickets(eventId)

  if (tickets.length === 0) {
    return <div className="text-sm text-slate-600">No tickets sold yet.</div>
  }

  return (
    <div className="grid gap-2">
      {tickets.map((t) => (
        <TicketRow key={t.id} ticket={t} />
      ))}
    </div>
  )
}

export function ConsumerHistory({ consumerId }: { consumerId: string }) {
  const { consumerHistory } = useEvents()
  const tickets = consumerHistory(consumerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-sm text-slate-600">You have no bookings yet.</div>
        ) : (
          <div className="grid gap-2">
            {tickets.map((t) => (
              <TicketRow key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const date = useMemo(() => new Date(ticket.purchasedAt).toLocaleString(), [ticket.purchasedAt])
  const { events } = useEvents()
  const event = useMemo<Event | undefined>(() => events.find((e) => e.id === ticket.eventId), [events, ticket.eventId])

  const [open, setOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function render() {
      if (open && canvasRef.current) {
        const payload = buildTicketPayload(ticket, event)
        try {
          await drawQr(canvasRef.current, payload)
        } catch {
          // swallow in UI, could optionally show a toast
        }
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [open, ticket, event])

  return (
    <div className="border rounded-md">
      <div className="px-3 py-2 text-sm flex items-center justify-between">
        <div className="grid gap-0.5">
          <div>
            <span className="font-medium">Ticket:</span> {ticket.id}
          </div>
          <div>
            <span className="font-medium">Category:</span> {ticket.category} —{" "}
            <span className="font-medium">Seat:</span> {ticket.seatNumber}
          </div>
          <div>
            <span className="font-medium">Price:</span> ${ticket.price.toFixed(2)}
          </div>
        </div>
        <div className="text-right text-slate-600">
          <div className="font-mono text-xs">{date}</div>
          <div className="text-xs">By: {ticket.consumerName}</div>
          <div className="mt-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={`ticket-${ticket.id}-details`}
            >
              {open ? "Hide Details" : "View Details"}
            </Button>
          </div>
        </div>
      </div>

      {open ? (
        <div id={`ticket-${ticket.id}-details`} className="px-3 pb-3 border-t">
          <div className="grid gap-3 md:grid-cols-2 items-start">
            <div className="text-sm grid gap-1">
              <div className="font-medium">{event?.name ?? "Event"}</div>
              <div className="text-slate-700">
                {event?.date} {event?.time} • {event?.venue}
              </div>
              <div className="text-slate-700">
                ID: <span className="font-mono">{ticket.id}</span>
              </div>
            </div>
            <div className="flex md:justify-end">
              <div className="grid gap-2 items-center text-center">
                <canvas
                  ref={canvasRef}
                  width={144}
                  height={144}
                  aria-label={`QR code for ticket ${ticket.id}`}
                  className="border rounded-md bg-white"
                />
                <div className="text-xs text-slate-600">Scan at entry</div>
                <div className="flex justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadTicketPdf(ticket, event)}
                    aria-label="Download ticket PDF"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
