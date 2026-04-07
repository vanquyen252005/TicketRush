import { Event, Seat, Booking, Ticket } from "./types";

// Mock data store
class Store {
  private events: Event[] = [];
  private seats: Map<string, Seat[]> = new Map();
  private bookings: Booking[] = [];
  private tickets: Ticket[] = [];
  private currentBooking: Booking | null = null;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    this.events = [
      {
        id: "1",
        name: "Anh Trai Say Hi Concert 2026",
        venue: "Sân vận động Mỹ Đình",
        date: "2026-05-15",
        time: "19:00",
        imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        status: "open",
        totalSeats: 150,
        soldSeats: 45,
        price: { min: 500000, max: 2000000 },
      },
      {
        id: "2",
        name: "Sơn Tùng M-TP Live Tour",
        venue: "Nhà hát Hòa Bình",
        date: "2026-06-20",
        time: "20:00",
        imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
        status: "upcoming",
        openSaleDate: "2026-04-20T10:00:00",
        totalSeats: 200,
        soldSeats: 0,
        price: { min: 800000, max: 3000000 },
      },
      {
        id: "3",
        name: "Rap Việt All-Stars",
        venue: "Cung Văn hóa Lao động",
        date: "2026-07-10",
        time: "18:30",
        imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
        status: "soldout",
        totalSeats: 120,
        soldSeats: 120,
        price: { min: 600000, max: 1500000 },
      },
      {
        id: "4",
        name: "Đen Vâu & Friends",
        venue: "Nhà hát Quân đội",
        date: "2026-08-05",
        time: "19:30",
        imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
        status: "open",
        totalSeats: 180,
        soldSeats: 67,
        price: { min: 700000, max: 2500000 },
      },
    ];
  }

  // Event methods
  getEvents(): Event[] {
    return this.events;
  }

  getEvent(id: string): Event | undefined {
    return this.events.find((e) => e.id === id);
  }

  updateEvent(id: string, updates: Partial<Event>): void {
    const index = this.events.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updates };
    }
  }

  addEvent(event: Event): void {
    this.events.push(event);
  }

  // Seat methods
  getSeats(eventId: string): Seat[] {
    if (!this.seats.has(eventId)) {
      this.generateSeatsForEvent(eventId);
    }
    return this.seats.get(eventId) || [];
  }

  private generateSeatsForEvent(eventId: string): void {
    const zones = [
      { id: "vip", name: "VIP", rows: 5, cols: 10, price: 2000000 },
      { id: "a", name: "Zone A", rows: 5, cols: 10, price: 1500000 },
      { id: "b", name: "Zone B", rows: 5, cols: 10, price: 1000000 },
    ];

    const seats: Seat[] = [];
    let seatId = 0;

    zones.forEach((zone) => {
      for (let row = 1; row <= zone.rows; row++) {
        for (let col = 1; col <= zone.cols; col++) {
          const status: typeof seats[0]["status"] =
            Math.random() < 0.3
              ? "sold"
              : Math.random() < 0.1
              ? "locked"
              : "available";

          seats.push({
            id: `${eventId}-${seatId++}`,
            row,
            col,
            zone: zone.name,
            price: zone.price,
            status,
            label: `${zone.name}-${String.fromCharCode(64 + row)}${col}`,
          });
        }
      }
    });

    this.seats.set(eventId, seats);
  }

  updateSeatStatus(eventId: string, seatId: string, status: Seat["status"]): void {
    const seats = this.getSeats(eventId);
    const seat = seats.find((s) => s.id === seatId);
    if (seat) {
      seat.status = status;
    }
  }

  // Booking methods
  getCurrentBooking(): Booking | null {
    return this.currentBooking;
  }

  createBooking(eventId: string, seats: Seat[]): Booking {
    const event = this.getEvent(eventId);
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      eventId,
      eventName: event?.name || "",
      seats,
      total: seats.reduce((sum, seat) => sum + seat.price, 0),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    this.currentBooking = booking;
    return booking;
  }

  updateBooking(updates: Partial<Booking>): void {
    if (this.currentBooking) {
      this.currentBooking = { ...this.currentBooking, ...updates };
    }
  }

  clearBooking(): void {
    this.currentBooking = null;
  }

  // Ticket methods
  getTickets(): Ticket[] {
    return this.tickets;
  }

  addTicket(ticket: Ticket): void {
    this.tickets.push(ticket);
  }
}

export const store = new Store();
