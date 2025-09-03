"use client"

import { useState } from "react"
import { useEvents } from "./events-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"

export function SeatGrid({ eventId }: { eventId: string }) {
  const { events, getCategoryInfo, bookTicket } = useEvents()
  const { user } = useAuth()
  const { toast } = useToast()
  const event = events.find((e) => e.id === eventId)
  const [pending, setPending] = useState<{ cat: string; seat: number } | null>(null)

  if (!event) return <div>Event not found.</div>

  function selectSeat(category: string, seat: number) {
    setPending({ cat: category, seat })
  }

  function confirm() {
    if (!pending || !user) return
    const result = bookTicket(eventId, pending.cat, pending.seat, user)
    if (result.ok) {
      toast({ title: "Booking Successful", description: `Seat ${pending.seat} in ${pending.cat} booked.` })
      setPending(null)
    } else {
      toast({ title: "Booking Failed", description: result.reason })
    }
  }

  return (
    <div className="grid gap-6">
      {event.categories.map((c) => {
        const info = getCategoryInfo(event.id, c.name)
        if (!info) return null
        const soldOut = info.bookedSeatSet.size >= info.capacity

        return (
          <Card key={c.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-pretty">{c.name}</span>
                <span className="text-sm font-normal text-slate-600">
                  ${info.price.toFixed(2)} • {info.capacity - info.bookedSeatSet.size} / {info.capacity} available
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {soldOut ? (
                <div className="text-red-600 font-medium">Sold Out</div>
              ) : (
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                  }}
                >
                  {Array.from({ length: info.capacity }, (_, i) => i + 1).map((seat) => {
                    const booked = info.bookedSeatSet.has(seat)
                    const isPending = pending?.cat === c.name && pending?.seat === seat
                    return (
                      <button
                        key={seat}
                        type="button"
                        aria-label={`Seat ${seat} ${booked ? "booked" : "available"}`}
                        disabled={booked}
                        onClick={() => selectSeat(c.name, seat)}
                        className={[
                          "h-9 rounded-md text-xs font-medium border",
                          booked
                            ? "bg-red-500 text-white border-red-600 cursor-not-allowed"
                            : "bg-green-500 text-white border-green-600 hover:bg-green-600",
                          isPending ? "ring-2 ring-blue-600" : "",
                        ].join(" ")}
                      >
                        {seat}
                      </button>
                    )
                  })}
                </div>
              )}

              {pending && pending.cat === c.name ? (
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="text-sm">
                    Confirm seat <span className="font-semibold">{pending.seat}</span> in{" "}
                    <span className="font-semibold">{c.name}</span> for{" "}
                    <span className="font-semibold">${info.price.toFixed(2)}</span>?
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPending(null)}>
                      Cancel
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirm}>
                      Confirm Purchase
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
