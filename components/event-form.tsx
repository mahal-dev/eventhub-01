"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "./auth-context"
import { useEvents, type Event, type TicketCategory } from "./events-context"
import { useToast } from "@/hooks/use-toast"

type EventInput = Omit<Event, "id" | "organizerId" | "createdAt" | "categories"> & {
  categories: TicketCategory[]
}

export function EventForm() {
  const { user } = useAuth()
  const { createEvent } = useEvents()
  const { toast } = useToast()

  const [form, setForm] = useState<EventInput>({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    categories: [
      { name: "Premium", price: 150, capacity: 10 },
      { name: "Standard", price: 80, capacity: 20 },
    ],
  })

  function updateField<K extends keyof EventInput>(key: K, val: EventInput[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function updateCategory(idx: number, cat: Partial<TicketCategory>) {
    setForm((f) => {
      const next = [...f.categories]
      next[idx] = { ...next[idx], ...cat }
      return { ...f, categories: next }
    })
  }

  function addCategory() {
    setForm((f) => ({ ...f, categories: [...f.categories, { name: "", price: 0, capacity: 0 }] }))
  }

  function removeCategory(idx: number) {
    setForm((f) => {
      const next = f.categories.filter((_, i) => i !== idx)
      return { ...f, categories: next }
    })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.name.trim() || !form.date || !form.time || !form.venue.trim()) {
      toast({ title: "Missing fields", description: "Please fill event name, date, time, and venue." })
      return
    }
    const validCats = form.categories.filter((c) => c.name.trim() && c.capacity > 0 && c.price >= 0)
    if (validCats.length === 0) {
      toast({ title: "Invalid categories", description: "Add at least one valid ticket category." })
      return
    }
    const ev = createEvent(user, { ...form, categories: validCats })
    toast({ title: "Event Created", description: `${ev.name} scheduled on ${ev.date} ${ev.time}` })
    setForm({
      name: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      categories: [{ name: "Premium", price: 150, capacity: 10 }],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Create New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Event Name</Label>
            <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" value={form.venue} onChange={(e) => updateField("venue", e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description (optional)</Label>
            <Input id="desc" value={form.description} onChange={(e) => updateField("description", e.target.value)} />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Ticket Categories</div>
              <Button type="button" variant="outline" onClick={addCategory}>
                Add Category
              </Button>
            </div>
            <div className="grid gap-3">
              {form.categories.map((c, idx) => (
                <div key={idx} className="grid grid-cols-7 gap-2 items-end border rounded-md p-3">
                  <div className="col-span-3">
                    <Label className="sr-only">Name</Label>
                    <Input
                      placeholder="Name (e.g., Premium)"
                      value={c.name}
                      onChange={(e) => updateCategory(idx, { name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="sr-only">Price</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Price"
                      value={c.price}
                      onChange={(e) => updateCategory(idx, { price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="sr-only">Capacity</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Cap"
                      value={c.capacity}
                      onChange={(e) => updateCategory(idx, { capacity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeCategory(idx)}
                      aria-label="Remove category"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Event
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
