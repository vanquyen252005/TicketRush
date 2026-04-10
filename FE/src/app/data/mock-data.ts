export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  status: 'DRAFT' | 'COMING_SOON' | 'SELLING' | 'SOLD_OUT' | 'COMPLETED';
  image: string;
  category: string;
}

export interface Zone {
  id: number;
  event_id: number;
  name: string;
  base_price: number;
  color_hex: string;
  capacity: number;
  available: number;
}

export interface Seat {
  id: number;
  zone_id: number;
  row_label: string;
  seat_number: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price: number;
}

export interface Booking {
  id: string;
  event_name: string;
  event_date: string;
  location: string;
  seats: Array<{
    zone: string;
    row: string;
    number: string;
  }>;
  total_amount: number;
  ticket_code: string;
  check_in_status: 'UNUSED' | 'USED' | 'REFUNDED';
  qr_code: string;
}

export const mockEvents: Event[] = [
  {
    id: 1,
    name: "Monsoon Music Festival 2026",
    description: "Lễ hội âm nhạc quốc tế lớn nhất năm với sự tham gia của các nghệ sĩ hàng đầu thế giới",
    location: "Công viên Yên Sở, Hà Nội",
    start_time: "2026-06-15T18:00:00",
    end_time: "2026-06-15T23:00:00",
    status: 'SELLING',
    image: "https://images.unsplash.com/photo-1605286232233-e448650f5914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzU2NjA4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Âm nhạc"
  },
  {
    id: 2,
    name: "Vũ Điệu Ánh Sáng 2026",
    description: "Concert EDM hoành tráng với những màn trình diễn ánh sáng và pháo hoa đỉnh cao",
    location: "Nhà thi đấu Quân khu 7, TP.HCM",
    start_time: "2026-05-20T19:00:00",
    end_time: "2026-05-20T23:30:00",
    status: 'SELLING',
    image: "https://images.unsplash.com/photo-1658046413536-6e5933dfd939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBzdGFnZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzU3NTAwMTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Âm nhạc"
  },
  {
    id: 3,
    name: "Kịch Nói: Những Người Khốn Khổ",
    description: "Vở kịch kinh điển được dàn dựng hoành tráng với dàn diễn viên tài năng",
    location: "Nhà hát Lớn Hà Nội",
    start_time: "2026-05-01T19:30:00",
    end_time: "2026-05-01T22:00:00",
    status: 'COMING_SOON',
    image: "https://images.unsplash.com/photo-1761618291331-535983ae4296?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzU2MzcyMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Kịch nói"
  },
  {
    id: 4,
    name: "Chung kết V.League 2026",
    description: "Trận chung kết đỉnh cao của giải bóng đá chuyên nghiệp Việt Nam",
    location: "Sân vận động Mỹ Đình, Hà Nội",
    start_time: "2026-07-10T18:00:00",
    end_time: "2026-07-10T21:00:00",
    status: 'COMING_SOON',
    image: "https://images.unsplash.com/photo-1771344159298-3a6a5b704c97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwZXZlbnR8ZW58MXx8fHwxNzc1NjQ0NjYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Thể thao"
  },
  {
    id: 5,
    name: "Đêm Nhạc Trịnh Công Sơn",
    description: "Đêm nhạc tưởng nhớ và tri ân nhạc sĩ Trịnh Công Sơn với những ca khúc bất hủ",
    location: "Nhà hát Hòa Bình, TP.HCM",
    start_time: "2026-04-27T20:00:00",
    end_time: "2026-04-27T22:30:00",
    status: 'SOLD_OUT',
    image: "https://images.unsplash.com/photo-1658046413536-6e5933dfd939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBzdGFnZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzU3NTAwMTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Âm nhạc"
  },
  {
    id: 6,
    name: "Hội chợ Sách và Văn hóa 2026",
    description: "Triển lãm sách và các hoạt động văn hóa đa dạng",
    location: "Trung tâm Triển lãm Giảng Võ, Hà Nội",
    start_time: "2026-08-01T08:00:00",
    end_time: "2026-08-05T20:00:00",
    status: 'COMING_SOON',
    image: "https://images.unsplash.com/photo-1605286232233-e448650f5914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzU2NjA4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Văn hóa"
  }
];

export const mockZones: Zone[] = [
  { id: 1, event_id: 1, name: "VIP A", base_price: 2000000, color_hex: "#FF6B6B", capacity: 50, available: 20 },
  { id: 2, event_id: 1, name: "VIP B", base_price: 1500000, color_hex: "#FFA500", capacity: 100, available: 45 },
  { id: 3, event_id: 1, name: "Standard", base_price: 800000, color_hex: "#4ECDC4", capacity: 200, available: 150 },
  { id: 4, event_id: 1, name: "Economy", base_price: 400000, color_hex: "#95E1D3", capacity: 300, available: 0 },
];

export const generateSeats = (zoneId: number, rows: number, seatsPerRow: number, bookedPercentage: number = 0.3): Seat[] => {
  const seats: Seat[] = [];
  const zone = mockZones.find(z => z.id === zoneId);
  if (!zone) return seats;

  for (let i = 0; i < rows; i++) {
    const rowLabel = String.fromCharCode(65 + i); // A, B, C...
    for (let j = 1; j <= seatsPerRow; j++) {
      const random = Math.random();
      let status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' = 'AVAILABLE';
      
      if (zone.available === 0) {
        status = 'BOOKED';
      } else if (random < bookedPercentage) {
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
        price: zone.base_price
      });
    }
  }
  return seats;
};

export const mockBookings: Booking[] = [
  {
    id: "TR-9A8B7C",
    event_name: "Monsoon Music Festival 2026",
    event_date: "2026-06-15T18:00:00",
    location: "Công viên Yên Sở, Hà Nội",
    seats: [
      { zone: "VIP A", row: "A", number: "05" },
      { zone: "VIP A", row: "A", number: "06" }
    ],
    total_amount: 4000000,
    ticket_code: "TR-9A8B7C",
    check_in_status: 'UNUSED',
    qr_code: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg=="
  },
  {
    id: "TR-5D2F1E",
    event_name: "Vũ Điệu Ánh Sáng 2026",
    event_date: "2026-05-20T19:00:00",
    location: "Nhà thi đấu Quân khu 7, TP.HCM",
    seats: [
      { zone: "Standard", row: "C", number: "12" }
    ],
    total_amount: 800000,
    ticket_code: "TR-5D2F1E",
    check_in_status: 'UNUSED',
    qr_code: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg=="
  }
];

export const mockDashboardStats = {
  totalRevenue: 125000000,
  totalTicketsSold: 1250,
  activeEvents: 4,
  averageFillRate: 68,
  revenueData: [
    { month: 'T1', revenue: 15000000 },
    { month: 'T2', revenue: 18000000 },
    { month: 'T3', revenue: 22000000 },
    { month: 'T4', revenue: 25000000 },
    { month: 'T5', revenue: 20000000 },
    { month: 'T6', revenue: 25000000 },
  ],
  ticketData: [
    { month: 'T1', tickets: 150 },
    { month: 'T2', tickets: 180 },
    { month: 'T3', tickets: 220 },
    { month: 'T4', tickets: 250 },
    { month: 'T5', tickets: 200 },
    { month: 'T6', tickets: 250 },
  ],
  eventPerformance: [
    { name: 'Monsoon Music Festival', sold: 850, total: 1000, revenue: 68000000 },
    { name: 'Vũ Điệu Ánh Sáng', sold: 400, total: 800, revenue: 32000000 },
    { name: 'Kịch Nói', sold: 0, total: 500, revenue: 0 },
    { name: 'V.League Final', sold: 0, total: 5000, revenue: 0 },
  ]
};
