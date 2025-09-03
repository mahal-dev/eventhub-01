"use client"

import React, { createContext, useContext, useMemo, useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { uid } from "@/lib/id"
import type { User } from "./auth-context"

export type TicketCategory = {
  name: string
  price: number
  capacity: number
}

export type Event = {
  id: string
  organizerId: string
  name: string
  date: string
  time: string
  venue: string
  description?: string
  categories: TicketCategory[]
  createdAt: number
}

export type Ticket = {
  id: string
  eventId: string
  category: string
  seatNumber: number
  price: number
  consumerId: string
  consumerName: string
  purchasedAt: number
}

type EventsContextType = {
  events: Event[]
  tickets: Ticket[]
  createEvent: (organizer: User, input: Omit<Event, "id" | "organizerId" | "createdAt">) => Event
  bookTicket: (
    eventId: string,
    category: string,
    seatNumber: number,
    consumer: User,
  ) => { ok: true; ticket: Ticket } | { ok: false; reason: string }
  getEventTickets: (eventId: string) => Ticket[]
  getCategoryInfo: (
    eventId: string,
    category: string,
  ) => { capacity: number; bookedSeatSet: Set<number>; price: number } | null
  consumerHistory: (consumerId: string) => Ticket[]
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useLocalStorage<Event[]>("ems_events", [])
  const [tickets, setTickets] = useLocalStorage<Ticket[]>("ems_tickets", [])

  // Seed a sample event once
  React.useEffect(() => {
    if (events.length === 0) {
      const sample: Event = {
        id: uid("evt_"),
        organizerId: "org_alice",
        name: "Tech Conference 2025",
        date: new Date().toISOString().slice(0, 10),
        time: "10:00",
        venue: "Grand Hall A",
        description: "A full-day event featuring talks and workshops.",
        categories: [
          { name: "Premium", price: 199, capacity: 12 },
          { name: "Standard", price: 99, capacity: 24 },
          { name: "Economy", price: 49, capacity: 30 },
        ],
        createdAt: Date.now(),
      }
      setEvents([sample])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createEvent: EventsContextType["createEvent"] = useCallback(
    (organizer, input) => {
      const event: Event = {
        ...input,
        id: uid("evt_"),
        organizerId: organizer.id,
        createdAt: Date.now(),
      }
      setEvents((prev) => [event, ...prev])
      return event
    },
    [setEvents],
  )

  const getEventTickets = useCallback<EventsContextType["getEventTickets"]>(
    (eventId) => tickets.filter((t) => t.eventId === eventId),
    [tickets],
  )

  const getCategoryInfo = useCallback<EventsContextType["getCategoryInfo"]>(
    (eventId, category) => {
      const ev = events.find((e) => e.id === eventId)
      if (!ev) return null
      const cat = ev.categories.find((c) => c.name === category)
      if (!cat) return null
      const bookedSeatSet = new Set(
        tickets.filter((t) => t.eventId === eventId && t.category === category).map((t) => t.seatNumber),
      )
      return { capacity: cat.capacity, bookedSeatSet, price: cat.price }
    },
    [events, tickets],
  )

  const bookTicket: EventsContextType["bookTicket"] = useCallback(
    (eventId, category, seatNumber, consumer) => {
      const info = getCategoryInfo(eventId, category)
      if (!info) return { ok: false as const, reason: "Category not found" }
      if (seatNumber < 1 || seatNumber > info.capacity) {
        return { ok: false as const, reason: "Invalid seat number" }
      }
      if (info.bookedSeatSet.has(seatNumber)) {
        return { ok: false as const, reason: "Seat already booked" }
      }
      const ticket: Ticket = {
        id: uid("tkt_"),
        eventId,
        category,
        seatNumber,
        price: info.price,
        consumerId: consumer.id,
        consumerName: consumer.name,
        purchasedAt: Date.now(),
      }
      setTickets((prev) => [ticket, ...prev])
      return { ok: true as const, ticket }
    },
    [getCategoryInfo, setTickets],
  )

  const consumerHistory = useCallback<EventsContextType["consumerHistory"]>(
    (consumerId) => tickets.filter((t) => t.consumerId === consumerId),
    [tickets],
  )

  const value = useMemo<EventsContextType>(
    () => ({
      events,
      tickets,
      createEvent,
      bookTicket,
      getEventTickets,
      getCategoryInfo,
      consumerHistory,
    }),
    [events, tickets, createEvent, bookTicket, getEventTickets, getCategoryInfo, consumerHistory],
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error("useEvents must be used within EventsProvider")
  return ctx
}
