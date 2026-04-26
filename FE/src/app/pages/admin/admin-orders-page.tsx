import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search, Eye, CheckCircle, Clock, XCircle, Ticket, User, MapPin, Calendar, Wallet } from "lucide-react";
import { BookingStatus, AdminBooking } from "../../types";
import { adminBookingService } from "../../services/admin-booking-service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { isAxiosError } from "axios";

type BookingFilter = BookingStatus | "ALL";

export function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingFilter>("ALL");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await adminBookingService.getBookings();
        setBookings(data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        setError(
          isAxiosError(err)
            ? (err.response?.data as any)?.error || (err.response?.data as any)?.message || err.message
            : "Không thể tải dữ liệu đơn hàng từ backend"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const haystack = [
        booking.id,
        booking.event_name,
        booking.event_location,
        booking.user_full_name,
        booking.user_email,
        booking.user_phone_number,
        booking.payment_transaction_id,
        ...(booking.items ?? []).map((item) => item.seat_label),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "EXPIRED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "EXPIRED":
        return <Clock className="w-4 h-4" />;
    }
  };

  const totalTickets = bookings.reduce((sum, booking) => sum + (booking.items?.length ?? 0), 0);
  const totalRevenue = bookings
    .filter((booking) => booking.status === "CONFIRMED")
    .reduce((sum, booking) => sum + (booking.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng đơn hàng</p>
          <p className="text-2xl font-bold text-slate-800">{bookings.length.toLocaleString("vi-VN")}</p>
          <div className="mt-2 flex items-center text-cyan-600 text-xs font-bold">
            <ShoppingBag className="w-3 h-3" />
            <span>Đồng bộ từ backend</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng vé</p>
          <p className="text-2xl font-bold text-slate-800">{totalTickets.toLocaleString("vi-VN")}</p>
          <div className="mt-2 flex items-center text-yellow-600 text-xs font-bold">
            <Ticket className="w-3 h-3" />
            <span>Theo booking items</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Doanh thu ghi nhận</p>
          <p className="text-2xl font-bold text-slate-800">{totalRevenue.toLocaleString("vi-VN")}đ</p>
          <div className="mt-2 flex items-center text-green-600 text-xs font-bold">
            <Wallet className="w-3 h-3" />
            <span>Chỉ tính đơn CONFIRMED</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, user, event, ghế..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"] as BookingFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                statusFilter === status
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {status === "ALL" ? "Tất cả" : status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Đơn hàng</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Khách hàng</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Sự kiện / Ghế</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Ngày đặt</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng tiền</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 animate-pulse font-bold">
                    Đang tải dữ liệu đơn hàng...
                  </td>
                </tr>
              ) : filteredBookings.map((booking) => {
                const seatCount = booking.items?.length ?? 0;
                const seatPreview = (booking.items ?? []).slice(0, 3).map((item) => item.seat_label);

                return (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 uppercase tracking-tighter">#{booking.id.substring(0, 8)}</div>
                          <div className="text-[10px] text-slate-400">ID: {booking.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{booking.user_full_name || "Không rõ"}</span>
                        </div>
                        <div className="text-xs text-slate-500">{booking.user_email}</div>
                        <div className="text-xs text-slate-500">{booking.user_phone_number || "---"}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2 max-w-[320px]">
                        <div className="text-sm font-semibold text-slate-700 line-clamp-1">
                          {booking.event_name || "Sự kiện không xác định"}
                        </div>
                        {booking.event_location && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{booking.event_location}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {seatPreview.map((seat) => (
                            <span key={seat} className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold">
                              {seat}
                            </span>
                          ))}
                          {seatCount > seatPreview.length && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              +{seatCount - seatPreview.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600">
                        {booking.created_at ? format(new Date(booking.created_at), "dd/MM/yyyy - HH:mm", { locale: vi }) : "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-cyan-600">
                        {booking.total_amount.toLocaleString("vi-VN")}đ
                      </div>
                      <div className="text-[11px] text-slate-400">{seatCount} ghế</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    Không tìm thấy đơn hàng nào khớp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Chi tiết đơn hàng #{selectedBooking.id.substring(0, 8).toUpperCase()}
                </h3>
                <p className="text-slate-500">Thông tin ghế, người đặt và sự kiện từ backend thật.</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Khách hàng</div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div>{selectedBooking.user_full_name || "Không rõ"}</div>
                  <div>{selectedBooking.user_email || "---"}</div>
                  <div>{selectedBooking.user_phone_number || "---"}</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Sự kiện</div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div className="font-semibold">{selectedBooking.event_name || "Không rõ"}</div>
                  <div>{selectedBooking.event_location || "---"}</div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {selectedBooking.created_at ? format(new Date(selectedBooking.created_at), "dd/MM/yyyy HH:mm", { locale: vi }) : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800">Các ghế đã đặt</h4>
                <span className="text-sm text-slate-500">{selectedBooking.items?.length ?? 0} ghế</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.items?.map((item) => (
                  <div key={item.id} className="px-3 py-2 bg-cyan-50 text-cyan-700 rounded-xl text-sm font-semibold">
                    <div>{item.seat_label}</div>
                    <div className="text-[11px] text-cyan-600/80">
                      {item.zone_name ? `${item.zone_name} • ` : ""}{item.price_at_purchase.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Tổng tiền</div>
                <div className="text-xl font-bold text-cyan-600">{selectedBooking.total_amount.toLocaleString("vi-VN")}đ</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Trạng thái</div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border mt-1 ${getStatusStyle(selectedBooking.status)}`}>
                  {getStatusIcon(selectedBooking.status)}
                  {selectedBooking.status}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Mã giao dịch</div>
                <div className="text-sm font-mono text-slate-700 break-all">
                  {selectedBooking.payment_transaction_id || "---"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
