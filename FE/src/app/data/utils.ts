import { Event, Zone, Seat, Booking, BookingItem, PaymentTransaction, DashboardStats, User } from '../types';
import mockUsers from './mock-users.json';
import mockEventsData from './mock-events.json';
import mockZonesData from './mock-zones.json';
import mockSeatsData from './mock-seats.json';
import mockBookingsData from './mock-bookings.json';
import mockBookingItemsData from './mock-booking-items.json';
import mockTransactionsData from './mock-transactions.json';

export const mockUsersList = mockUsers as User[];
export const mockEvents = mockEventsData as Event[];
export const mockZones = mockZonesData as Zone[];
export const mockSeats = mockSeatsData as Seat[];
export const mockBookings = mockBookingsData as Booking[];
export const mockBookingItems = mockBookingItemsData as BookingItem[];
export const mockTransactions = mockTransactionsData as any as PaymentTransaction[];

export const mockDashboardStats: DashboardStats = {
  total_revenue: 125000000,
  total_tickets_sold: 1250,
  active_events: 4,
  average_fill_rate: 68,
  revenue_data: [
    { month: "T1", revenue: 15000000 },
    { month: "T2", revenue: 18000000 },
    { month: "T3", revenue: 22000000 },
    { month: "T4", revenue: 25000000 },
    { month: "T5", revenue: 20000000 },
    { month: "T6", revenue: 25000000 }
  ],
  ticket_data: [
    { month: "T1", tickets: 150 },
    { month: "T2", tickets: 180 },
    { month: "T3", tickets: 220 },
    { month: "T4", tickets: 250 },
    { month: "T5", tickets: 200 },
    { month: "T6", tickets: 250 }
  ],
  event_performance: [
    { name: "Monsoon Music Festival", sold: 850, total: 1000, revenue: 68000000 },
    { name: "Bae Suzy Fan Meeting", sold: 400, total: 800, revenue: 32000000 }
  ]
};

export const generateSeats = (zoneId: number, rows: number, seatsPerRow: number, bookedPercentage: number = 0.3): Seat[] => {
  const seats: Seat[] = [];
  const zone = mockZones.find((z: any) => z.id === zoneId);
  if (!zone) return seats;

  for (let i = 0; i < rows; i++) {
    const rowLabel = String.fromCharCode(65 + i); // A, B, C...
    for (let j = 1; j <= seatsPerRow; j++) {
      const random = Math.random();
      let status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' = 'AVAILABLE';
      
      if (random < bookedPercentage) {
        status = 'BOOKED';
      } else if (random < bookedPercentage + 0.05) {
        status = 'LOCKED';
      }

      seats.push({
        id: seats.length + 1,
        zone_id: zoneId,
        row_label: rowLabel,
        seat_number: j.toString().padStart(2, '0'),
        status,
      });
    }
  }
  return seats;
};
