"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Event, useEvents } from "./events-context"

export function EventCard({ event }: { event: Event }) {
  const { getCategoryInfo } = useEvents()
  const totalCap = event.categories.reduce((acc, c) => acc + c.capacity, 0)
  const booked = event.categories.reduce(
    (acc, c) => acc + (getCategoryInfo(event.id, c.name)?.bookedSeatSet.size || 0),
    0,
  )
  const remaining = totalCap - booked

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-600 grid gap-1">
        <div>
          <span className="font-medium text-slate-800">When:</span> {event.date} at {event.time}
        </div>
        <div>
          <span className="font-medium text-slate-800">Where:</span> {event.venue}
        </div>
        {event.description ? <p className="mt-2">{event.description}</p> : null}
        <div className="mt-2">
          <span className="font-medium text-slate-800">Availability:</span>{" "}
          <span className={remaining > 0 ? "text-green-600" : "text-red-600"}>
            {remaining > 0 ? `${remaining} seats left` : "Sold Out"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href={`/consumer/${event.id}`}>View & Buy</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
