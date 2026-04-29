import type { Booking, Event, PaymentTransaction, User } from "../types";

export interface TicketQrPayload {
  order: {
    bookingId: string;
    bookingStatus: string;
    totalAmount: number;
    event: {
      id?: number;
      name: string;
      time?: string;
      location?: string;
    };
    seats: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  customer: {
    userId?: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  transaction?: {
    transactionId: string;
    bookingId?: string;
    userId?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    gatewayTransactionId?: string;
    referenceTxnId?: string;
    errorMessage?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  generatedAt: string;
}

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

const statusLabels: Record<string, string> = {
  PENDING: "Đang giữ chỗ",
  CONFIRMED: "Đã xác nhận",
  PAID: "Đã xác nhận",
  EXPIRED: "Đã hết hạn",
  CANCELLED: "Đã hủy",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

const paymentMethodLabels: Record<string, string> = {
  INTERNAL: "Nội bộ",
  VNPAY: "VNPay",
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  STRIPE: "Stripe",
  CREDIT_CARD: "Thẻ tín dụng",
};

export function formatTicketAmount(amount?: number | null): string {
  return `${moneyFormatter.format(amount ?? 0)}đ`;
}

export function formatTicketDateTime(value?: string | null): string {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function getBookingStatusLabel(status?: string | null): string {
  if (!status) {
    return "Không xác định";
  }

  return statusLabels[status] ?? status;
}

export function getPaymentStatusLabel(status?: string | null): string {
  if (!status) {
    return "Không xác định";
  }

  return statusLabels[status] ?? status;
}

export function getPaymentMethodLabel(method?: string | null): string {
  if (!method) {
    return "Không xác định";
  }

  return paymentMethodLabels[method] ?? method;
}

export function buildTicketQrPayload(params: {
  booking: Booking;
  event: Event;
  seats: string[];
  user?: User | null;
  transaction?: PaymentTransaction | null;
}): TicketQrPayload {
  const { booking, event, seats, user, transaction } = params;

  return {
    order: {
      bookingId: booking.id,
      bookingStatus: booking.status,
      totalAmount: booking.total_amount || 0,
      event: {
        id: event.id,
        name: event.name,
        time: event.startTime || event.start_time,
        location: event.location,
      },
      seats,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
    },
    customer: {
      userId: user?.id,
      fullName: user?.full_name || "Không rõ",
      phoneNumber: user?.phone_number || undefined,
      email: user?.email || undefined,
    },
    transaction: transaction
      ? {
          transactionId: transaction.id,
          bookingId: transaction.booking_id,
          userId: transaction.user_id,
          amount: transaction.amount || booking.total_amount || 0,
          currency: transaction.currency || "VND",
          paymentMethod: transaction.payment_method,
          status: transaction.status,
          gatewayTransactionId: transaction.gateway_transaction_id,
          referenceTxnId: transaction.reference_txn_id,
          errorMessage: transaction.error_message,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at,
        }
      : undefined,
    generatedAt: new Date().toISOString(),
  };
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isLocalOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function normalizeLegacyPayload(raw: any): TicketQrPayload | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  if (raw.order && raw.customer) {
    return {
      order: {
        bookingId: String(raw.order.bookingId || raw.order.booking_id || ""),
        bookingStatus: String(raw.order.bookingStatus || raw.order.status || "CONFIRMED"),
        totalAmount: Number(raw.order.totalAmount || raw.order.amount || 0),
        event: {
          id: raw.order.event?.id,
          name: String(raw.order.event?.name || ""),
          time: raw.order.event?.time,
          location: raw.order.event?.location,
        },
        seats: Array.isArray(raw.order.seats)
          ? raw.order.seats.map((seat: any) => String(seat))
          : typeof raw.order.seats === "string" && raw.order.seats
            ? raw.order.seats.split(",").map((seat: string) => seat.trim()).filter(Boolean)
            : [],
        createdAt: raw.order.createdAt,
        updatedAt: raw.order.updatedAt,
      },
      customer: {
        userId: raw.customer.userId,
        fullName: String(raw.customer.fullName || "Không rõ"),
        phoneNumber: raw.customer.phoneNumber,
        email: raw.customer.email,
      },
      transaction: raw.transaction
        ? {
            transactionId: String(raw.transaction.transactionId || raw.transaction.id || ""),
            bookingId: raw.transaction.bookingId,
            userId: raw.transaction.userId,
            amount: Number(raw.transaction.amount || 0),
            currency: String(raw.transaction.currency || "VND"),
            paymentMethod: String(raw.transaction.paymentMethod || ""),
            status: String(raw.transaction.status || ""),
            gatewayTransactionId: raw.transaction.gatewayTransactionId,
            referenceTxnId: raw.transaction.referenceTxnId,
            errorMessage: raw.transaction.errorMessage,
            createdAt: raw.transaction.createdAt,
            updatedAt: raw.transaction.updatedAt,
          }
        : undefined,
      generatedAt: String(raw.generatedAt || new Date().toISOString()),
    };
  }

  const bookingId = String(raw.bookingId || raw.booking_id || "");
  const eventName = String(raw.event?.name || raw.event_name || "");
  const eventTime = raw.event?.time || raw.event_time || raw.event?.startTime || raw.event?.start_time;
  const eventLocation = String(raw.event?.location || raw.location || "");
  const seats = Array.isArray(raw.seats)
    ? raw.seats.map((seat: any) => String(seat))
    : typeof raw.seats === "string" && raw.seats
      ? raw.seats.split(",").map((seat: string) => seat.trim()).filter(Boolean)
      : [];

  if (!bookingId) {
    return null;
  }

  return {
    order: {
      bookingId,
      bookingStatus: String(raw.status || raw.bookingStatus || "CONFIRMED"),
      totalAmount: Number(raw.amount || raw.totalAmount || 0),
      event: {
        id: raw.event?.id,
        name: eventName,
        time: eventTime,
        location: eventLocation,
      },
      seats,
      createdAt: raw.createdAt || raw.created_at,
      updatedAt: raw.updatedAt || raw.updated_at,
    },
    customer: {
      userId: raw.user?.id,
      fullName: String(raw.user?.name || raw.user?.full_name || raw.customer?.fullName || "Không rõ"),
      phoneNumber: raw.user?.phone || raw.user?.phone_number,
      email: raw.user?.email,
    },
    transaction: raw.transaction
      ? {
          transactionId: String(raw.transaction.transactionId || raw.transaction.id || ""),
          bookingId: raw.transaction.bookingId,
          userId: raw.transaction.userId,
          amount: Number(raw.transaction.amount || 0),
          currency: String(raw.transaction.currency || "VND"),
          paymentMethod: String(raw.transaction.paymentMethod || ""),
          status: String(raw.transaction.status || ""),
          gatewayTransactionId: raw.transaction.gatewayTransactionId,
          referenceTxnId: raw.transaction.referenceTxnId,
          errorMessage: raw.transaction.errorMessage,
          createdAt: raw.transaction.createdAt,
          updatedAt: raw.transaction.updatedAt,
        }
      : undefined,
    generatedAt: String(raw.generatedAt || new Date().toISOString()),
  };
}

export function normalizeTicketQrPayload(raw: any): TicketQrPayload | null {
  return normalizeLegacyPayload(raw);
}

export function encodeTicketQrPayload(payload: TicketQrPayload): string {
  return encodeBase64Url(JSON.stringify(payload));
}

export function decodeTicketQrPayload(value: string): TicketQrPayload | null {
  if (!value) {
    return null;
  }

  const candidates = [
    () => JSON.parse(decodeBase64Url(value)),
    () => JSON.parse(decodeURIComponent(atob(value))),
  ];

  for (const candidate of candidates) {
    try {
      return normalizeTicketQrPayload(candidate());
    } catch {
      continue;
    }
  }

  return null;
}

export function buildTicketVerifyUrl(payload: TicketQrPayload): string | null {
  const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  const origin =
    configuredUrl ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!origin) {
    return null;
  }

  if (!configuredUrl && isLocalOrigin(origin)) {
    return null;
  }

  return `${origin.replace(/\/+$/g, "")}/ticket/verify?data=${encodeTicketQrPayload(payload)}`;
}

export function buildTicketQrReceiptText(payload: TicketQrPayload): string {
  const lines = [
    "TicketRush",
    `Khách: ${payload.customer.fullName}`,
    `Đơn hàng: ${payload.order.bookingId.substring(0, 8).toUpperCase()}`,
    `Sự kiện: ${payload.order.event.name}`,
    `Ghế: ${payload.order.seats.join(", ") || "Chưa cập nhật"}`,
    `Tổng tiền: ${formatTicketAmount(payload.order.totalAmount)}`,
  ];

  if (payload.transaction) {
    lines.push(`Thanh toán: ${getPaymentMethodLabel(payload.transaction.paymentMethod)}`);
    lines.push(`Trạng thái GD: ${getPaymentStatusLabel(payload.transaction.status)}`);
    const transactionCode =
      payload.transaction.gatewayTransactionId ||
      payload.transaction.referenceTxnId ||
      payload.transaction.transactionId;

    lines.push(`Mã giao dịch: ${transactionCode || "Chưa cập nhật"}`);
  } else {
    lines.push("Thanh toán: Chưa cập nhật");
    lines.push("Trạng thái GD: Chưa cập nhật");
  }

  lines.push(`Phát hành: ${formatTicketDateTime(payload.generatedAt)}`);

  return lines.join("\n");
}
