import type { Ticket, Event } from "@/components/events-context"

export function buildTicketPayload(ticket: Ticket, event: Event | undefined) {
  return JSON.stringify(
    {
      v: 1,
      ticketId: ticket.id,
      eventId: ticket.eventId,
      eventName: event?.name ?? "Unknown Event",
      date: event?.date ?? "",
      time: event?.time ?? "",
      venue: event?.venue ?? "",
      category: ticket.category,
      seatNumber: ticket.seatNumber,
      price: ticket.price,
      consumerName: ticket.consumerName,
      purchasedAt: ticket.purchasedAt,
    },
    null,
    0,
  )
}

export async function downloadTicketPdf(ticket: Ticket, event: Event | undefined) {
  const [{ jsPDF }, QR] = await Promise.all([import("jspdf"), import("qrcode")])

  const payload = buildTicketPayload(ticket, event)
  const qrDataUrl = await QR.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 192,
    color: { dark: "#111827", light: "#ffffff" },
  })

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const BLUE = "#2563eb" // blue-600
  const SLATE = "#334155" // slate-700
  const BLACK = "#111827" // slate-900

  // Header
  doc.setTextColor(BLACK)
  doc.setFontSize(20)
  doc.text("Event Ticket", 56, 64)

  // Event details
  doc.setTextColor(BLUE)
  doc.setFontSize(16)
  doc.text(event?.name ?? "Unknown Event", 56, 100)
  doc.setTextColor(SLATE)
  doc.setFontSize(12)
  doc.text(`When: ${event?.date ?? ""} ${event?.time ?? ""}`, 56, 120)
  doc.text(`Where: ${event?.venue ?? ""}`, 56, 136)

  // Ticket details
  doc.setTextColor(BLACK)
  doc.setFontSize(12)
  const purchased = new Date(ticket.purchasedAt).toLocaleString()
  const details = [
    `Ticket ID: ${ticket.id}`,
    `Category: ${ticket.category}`,
    `Seat: ${ticket.seatNumber}`,
    `Price: $${ticket.price.toFixed(2)}`,
    `Name: ${ticket.consumerName}`,
    `Purchased: ${purchased}`,
  ]
  let y = 168
  details.forEach((line) => {
    doc.text(line, 56, y)
    y += 18
  })

  // QR image
  doc.addImage(qrDataUrl, "PNG", 370, 88, 160, 160)
  doc.setTextColor(SLATE)
  doc.setFontSize(10)
  doc.text("Scan at entry for verification", 370, 260)

  // Footer note
  doc.setTextColor(SLATE)
  doc.setFontSize(9)
  doc.text("This is a demo ticket generated client-side (localStorage).", 56, 780)

  doc.save(`ticket_${ticket.id}.pdf`)
}
