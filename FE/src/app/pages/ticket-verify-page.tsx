import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Clock,
  User,
  Armchair,
  Ticket,
  ReceiptText,
} from "lucide-react";
import {
  decodeTicketQrPayload,
  formatTicketAmount,
  formatTicketDateTime,
  getBookingStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  type TicketQrPayload,
} from "../utils/ticket-qr";

export function TicketVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState<TicketQrPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const dataParam = searchParams.get("data");

      if (!dataParam) {
        setError("Không tìm thấy dữ liệu vé trong đường dẫn.");
        return;
      }

      const parsedData = decodeTicketQrPayload(dataParam);
      if (!parsedData) {
        setError("Dữ liệu vé không hợp lệ hoặc đã bị hỏng.");
        return;
      }

      setTicketData(parsedData);
    } catch (err) {
      console.error("Failed to parse ticket data:", err);
      setError("Dữ liệu vé không hợp lệ hoặc đã bị hỏng.");
    }
  }, [location.search]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Lỗi Đọc Vé</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const eventDate = ticketData.order.event.time ? new Date(ticketData.order.event.time) : null;
  const hasValidEventDate = eventDate !== null && !Number.isNaN(eventDate.getTime());
  const transactionCode =
    ticketData.transaction?.gatewayTransactionId ||
    ticketData.transaction?.referenceTxnId ||
    ticketData.transaction?.transactionId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full relative">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-white drop-shadow-md" />
              </div>
              <div className="inline-block px-4 py-1.5 bg-green-500 text-white text-sm font-bold tracking-wider rounded-full uppercase shadow-md mb-4">
                {getBookingStatusLabel(ticketData.order.bookingStatus)}
              </div>
              <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md">
                {ticketData.order.event.name || "Chưa cập nhật"}
              </h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Khách hàng
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {ticketData.customer.fullName || "Không rõ"}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 font-medium mt-1">
                  {ticketData.customer.phoneNumber && <span>{ticketData.customer.phoneNumber}</span>}
                  {ticketData.customer.email && <span>{ticketData.customer.email}</span>}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Ngày
                </p>
                <p className="text-base font-bold text-slate-800">
                  {hasValidEventDate ? eventDate!.toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Giờ
                </p>
                <p className="text-base font-bold text-slate-800">
                  {hasValidEventDate
                    ? eventDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                    : "Chưa cập nhật"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Địa điểm
                </p>
                <p className="text-base font-bold text-slate-800 line-clamp-2">
                  {ticketData.order.event.location || "Chưa cập nhật"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5" /> Số ghế
                </p>
                <p className="text-xl font-black text-cyan-600 tracking-wider">
                  {ticketData.order.seats.join(", ") || "Không có"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" /> Tổng tiền
                </p>
                <p className="text-xl font-black text-slate-800">
                  {formatTicketAmount(ticketData.order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-8 flex items-center justify-between px-2 bg-white">
            <div className="absolute left-0 w-4 h-8 bg-slate-800 rounded-r-full"></div>
            <div className="w-full border-t-2 border-dashed border-slate-300 mx-4"></div>
            <div className="absolute right-0 w-4 h-8 bg-slate-800 rounded-l-full"></div>
          </div>

          <div className="p-8 pt-4 bg-slate-50">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1">Mã đơn</p>
                <p className="text-2xl font-black text-cyan-600 tracking-wider">
                  {ticketData.order.bookingId.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-slate-400 mb-1">Cập nhật</p>
                <p className="text-sm font-semibold text-slate-700">
                  {formatTicketDateTime(ticketData.transaction?.updatedAt || ticketData.generatedAt)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-lg font-bold text-slate-800">Thông tin giao dịch</h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700">
                  {getPaymentStatusLabel(ticketData.transaction?.status)}
                </span>
              </div>

              {ticketData.transaction ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Phương thức</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {getPaymentMethodLabel(ticketData.transaction.paymentMethod)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Số tiền</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatTicketAmount(ticketData.transaction.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Mã giao dịch</p>
                    <p className="text-sm font-semibold text-slate-800 break-words">
                      {transactionCode || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Mã tham chiếu</p>
                    <p className="text-sm font-semibold text-slate-800 break-words">
                      {ticketData.transaction.referenceTxnId || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Trạng thái</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {getPaymentStatusLabel(ticketData.transaction.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Cập nhật</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatTicketDateTime(ticketData.transaction.updatedAt || ticketData.transaction.createdAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                  Không có dữ liệu giao dịch trong mã này.
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Phát hành bởi TicketRush
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/my-tickets")}
          className="mt-6 w-full py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/10"
        >
          Quay lại vé của tôi
        </button>
      </div>
    </div>
  );
}
