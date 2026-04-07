export type EventStatus = "upcoming" | "open" | "soldout";

export interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  imageUrl: string;
  status: EventStatus;
  openSaleDate?: string;
  totalSeats: number;
  soldSeats: number;
  price: {
    min: number;
    max: number;
  };
}

export type SeatStatus = "available" | "selected" | "locked" | "sold";

export interface Seat {
  id: string;
  row: number;
  col: number;
  zone: string;
  price: number;
  status: SeatStatus;
  label: string;
}

export interface Zone {
  id: string;
  name: string;
  color: string;
  rows: number;
  cols: number;
  price: number;
}

export interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  seats: Seat[];
  total: number;
  expiresAt: number;
  customerName?: string;
  customerEmail?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  venue: string;
  date: string;
  time: string;
  seatLabel: string;
  zone: string;
  price: number;
  qrCode: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
}
