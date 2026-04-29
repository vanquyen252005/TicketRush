export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'ORGANIZER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export type EventStatus = 'DRAFT' | 'COMING_SOON' | 'SELLING' | 'PUBLISHED' | 'SOLD_OUT' | 'COMPLETED' | 'CANCELLED';
export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
export type CheckInStatus = 'UNUSED' | 'USED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' | 'INTERNAL';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string; // BINARY(16) -> UUID string
  auth_provider: AuthProvider;
  google_id?: string;
  email: string;
  password?: string;
  full_name: string;
  phone_number: string;
  date_of_birth?: string;
  gender?: string;
  role: UserRole;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: number; // BIGINT
  name: string;
  description: string;
  location: string;
  start_time?: string;
  end_time?: string;
  status: EventStatus;
  image?: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  zones?: Zone[];
  created_at?: string;
  updated_at?: string;
}

export interface Zone {
  id: number; // BIGINT
  event_id: number;
  name: string;
  base_price: number;
  color_hex: string;
  capacity: number;
  available?: number;
  seats?: Seat[];
  created_at?: string;
}

export interface Seat {
  id: number; // BIGINT
  zone_id: number;
  row_label: string;
  seat_number: string;
  status: SeatStatus;
  lock_expires_at?: string;
  locked_by_user_id?: string; // UUID
  user_id?: string; // UUID (Owner)
}

export interface Booking {
  id: string; // UUID
  user_id: string; // UUID
  event_id: number; // BIGINT
  total_amount: number;
  status: BookingStatus;
  payment_transaction_id?: string;
  expires_at: string;
  items?: BookingItem[];
  created_at?: string;
  updated_at?: string;
}

export interface BookingItem {
  id: string; // UUID
  booking_id: string; // UUID
  seat_id: number; // BIGINT
  seat_label: string;
  price_at_purchase: number;
  ticket_code?: string;
  check_in_status?: CheckInStatus;
  checked_in_at?: string;
}

export interface PaymentTransaction {
  id: string; // UUID
  booking_id: string; // UUID
  user_id: string; // UUID
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  gateway_transaction_id?: string;
  reference_txn_id?: string;
  gateway_response_raw?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminBookingItem {
  id: string;
  seat_id?: number;
  seat_label: string;
  zone_name?: string;
  row_label?: string;
  seat_number?: string;
  price_at_purchase: number;
}

export interface AdminBooking {
  id: string;
  user_id?: string;
  user_full_name?: string;
  user_email?: string;
  user_phone_number?: string;
  event_id?: number;
  event_name?: string;
  event_location?: string;
  total_amount: number;
  status: BookingStatus;
  payment_transaction_id?: string;
  expires_at: string;
  created_at?: string;
  updated_at?: string;
  items?: AdminBookingItem[];
}

export interface AdminPaymentTransaction {
  id: string;
  booking_id?: string;
  event_id?: number;
  event_name?: string;
  user_id?: string;
  user_full_name?: string;
  user_email?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  gateway_transaction_id?: string;
  reference_txn_id?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminDashboardTransactionSummary {
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  successful_amount: number;
  latest_transaction_at?: string;
}

export interface AdminDashboardTransactionFeed {
  summary: AdminDashboardTransactionSummary;
  recent_transactions: AdminPaymentTransaction[];
  generated_at?: string;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  booking_count: number;
  ticket_count: number;
  transaction_count: number;
  total_spent: number;
  last_activity_at?: string;
}

export interface AdminUserDetail {
  user: AdminUserSummary;
  bookings: AdminBooking[];
  transactions: AdminPaymentTransaction[];
}

export interface DashboardStats {
  total_revenue: number;
  total_tickets_sold: number;
  active_events: number;
  average_fill_rate: number;
  revenue_data: Array<{ month: string; revenue: number }>;
  ticket_data: Array<{ month: string; tickets: number }>;
  event_performance: Array<{
    event_id?: number;
    name: string;
    sold: number;
    total: number;
    revenue: number;
    fill_rate?: number;
    status?: EventStatus;
  }>;
  audience_age_data?: Array<{ label: string; count: number; percentage: number }>;
  audience_gender_data?: Array<{ label: string; count: number; percentage: number }>;
  generated_at?: string;
}

export interface SeatLayoutSeatInput {
  row_label: string;
  seat_number: string;
}

export interface SeatLayoutZoneInput {
  id?: number;
  name: string;
  base_price: number;
  color_hex: string;
  seats: SeatLayoutSeatInput[];
}

export interface SeatLayoutRequest {
  rows: number;
  cols: number;
  zones: SeatLayoutZoneInput[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password?: string;
  phone_number: string;
}

export interface LoginData {
  email: string;
  password?: string;
}
