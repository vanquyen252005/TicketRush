import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router";
import { useAuth } from "../hooks/use-auth";
import { Ticket, MapPin, Calendar, Clock, QrCode, X } from "lucide-react";
import { eventService } from "../services/event-service";
import { bookingService } from "../services/booking-service";
import { paymentService } from "../services/payment-service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Booking, PaymentTransaction } from "../types";
import { QRCodeSVG } from "qrcode.react";
import {
  buildTicketQrPayload,
  buildTicketQrReceiptText,
  buildTicketVerifyUrl,
} from "../utils/ticket-qr";

export function MyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const { isAuthenticated, login, user } = useAuth();
  const location = useLocation();
  const isAdminView = location.pathname.startsWith('/admin');
  const homeLink = isAdminView ? '/admin/view-home' : '/';
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, bookingData] = await Promise.all([
          eventService.getAllEvents(),
          bookingService.getMyBookings(),
        ]);
        setEvents(eventData);
        setBookings(bookingData);
      } catch (error) {
        console.error("Lỗi khi tải sự kiện:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let active = true;

    const loadTransaction = async () => {
      if (!selectedTicket) {
        setSelectedTransaction(null);
        setTransactionLoading(false);
        return;
      }

      const booking = bookings.find((item) => item.id === selectedTicket);
      if (!booking || booking.status !== "CONFIRMED") {
        setSelectedTransaction(null);
        setTransactionLoading(false);
        return;
      }

      setTransactionLoading(true);
      try {
        const transaction = await paymentService.getTransactionByBookingId(booking.id);
        if (active) {
          setSelectedTransaction(transaction);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin giao dịch:", error);
        if (active) {
          setSelectedTransaction(null);
        }
      } finally {
        if (active) {
          setTransactionLoading(false);
        }
      }
    };

    loadTransaction();

    return () => {
      active = false;
    };
  }, [bookings, selectedTicket]);

  const userBookings = bookings.filter(b => b.status === 'CONFIRMED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            Đang giữ chỗ
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            Đã hết hạn
          </span>
        );
      case 'UNUSED':
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Đã xác nhận
          </span>
        );
      case 'USED':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            Đã sử dụng
          </span>
        );
      case 'REFUNDED':
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isAdminView ? 'p-0' : 'py-12'}`}>
      <div className={isAdminView ? 'w-full' : 'container mx-auto px-4'}>
        {!isAdminView && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              Vé của tôi
            </h1>
            <p className="text-slate-600">
              Quản lý tất cả vé điện tử của bạn
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 animate-pulse">
            <h3 className="text-xl font-semibold text-slate-700">Đang tải thông tin vé...</h3>
          </div>
        ) : userBookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <Ticket className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Chưa có vé nào
            </h3>
            <p className="text-slate-500 mb-6">
              Bạn chưa đặt vé cho sự kiện nào
            </p>
            <Link
              to={homeLink}
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              Khám phá sự kiện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userBookings.map((booking) => {
              const event = events.find(e => e.id === booking.event_id);
              const items = booking.items || [];
              const eventDate = event ? new Date(event.startTime || event.start_time) : new Date();

              return (
                <div
                  key={booking.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                          {event?.name || 'Sự kiện không còn tồn tại'}
                        </h3>
                        <div className="space-y-1 text-cyan-50 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event?.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(eventDate, "dd/MM/yyyy", { locale: vi })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{format(eventDate, "HH:mm", { locale: vi })}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-600 mb-2">
                        Ghế đã đặt
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-semibold"
                          >
                            {item.seat_label}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed">
                      <span className="text-slate-600">Tổng tiền</span>
                      <span className="text-xl font-bold text-cyan-600">
                        {booking.total_amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {booking.updated_at && booking.status === 'CONFIRMED' && (
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed">
                        <span className="text-slate-600 text-sm">Thời gian đặt vé</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {new Date(booking.updated_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          setSelectedTicket(booking.id);
                        } else {
                          login();
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Xem mã QR</span>
                    </button>

                    <div className="mt-3 text-center">
                      <span className="text-xs text-slate-500">
                        ID Đơn: {booking.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Decorative perforation */}
                  <div className="relative h-4">
                    <div className="absolute inset-0 flex justify-between">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-slate-50 rounded-full -mt-1"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* QR Code Modal */}
        {selectedTicket && (() => {
          const booking = bookings.find(b => b.id === selectedTicket);
          const event = events.find(e => e.id === booking?.event_id);
          const qrPayload = booking && event
            ? buildTicketQrPayload({
                booking,
                event,
                seats: booking.items?.map((item) => item.seat_label) || [],
                user,
                transaction: selectedTransaction,
              })
            : null;
          const verifyUrl = qrPayload ? buildTicketVerifyUrl(qrPayload) : null;
          const qrData = qrPayload ? buildTicketQrReceiptText(qrPayload) : "";

          return (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTicket(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-md w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Mã QR vé</h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-8 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center">
                      {transactionLoading || !qrPayload ? (
                        <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                          <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">Đang tải thông tin giao dịch...</span>
                        </div>
                      ) : (
                        <QRCodeSVG value={qrData} className="w-full h-full" level="M" />
                      )}
                    </div>
                  </div>
                </div>

              <div className="text-center space-y-2">
                <p className="text-slate-600">
                  Quét mã để xem thông tin đơn hàng và giao dịch
                </p>
                <p className="font-mono font-bold text-cyan-600 text-lg">
                  {selectedTicket.substring(0, 8).toUpperCase()}
                </p>
              </div>

                {!transactionLoading && booking && !selectedTransaction && (
                  <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    Chưa tải được chi tiết giao dịch, QR vẫn hiển thị thông tin đơn hàng.
                  </div>
                )}

                {verifyUrl && (
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 transition-colors"
                  >
                    Mở trang xác minh
                  </a>
                )}

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 text-center">
                    ⚠️ Tăng độ sáng màn hình để máy quét dễ đọc mã
                  </p>
                </div>
              </div>
            </div>
          );
        })()}


      </div>
    </div>
  );
}
