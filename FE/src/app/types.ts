export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'ORGANIZER';
export type UserStatus = 'ACTIVE' | 'BANNED';

export type EventStatus = 'DRAFT' | 'COMING_SOON' | 'SELLING' | 'SOLD_OUT' | 'COMPLETED';
export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
export type CheckInStatus = 'UNUSED' | 'USED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER';
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
  start_time: string;
  end_time: string;
  status: EventStatus;
  image?: string;
  category?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface BookingItem {
  id: string; // UUID
  booking_id: string; // UUID
  seat_id: number; // BIGINT
  seat_label: string;
  price_at_purchase: number;
  ticket_code: string;
  check_in_status: CheckInStatus;
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

export interface DashboardStats {
  total_revenue: number;
  total_tickets_sold: number;
  active_events: number;
  average_fill_rate: number;
  revenue_data: Array<{ month: string; revenue: number }>;
  ticket_data: Array<{ month: string; tickets: number }>;
  event_performance: Array<{
    name: string;
    sold: number;
    total: number;
    revenue: number;
  }>;
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

