import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CheckCircle2, XCircle, MapPin, Calendar, Clock, User, Armchair, Ticket } from "lucide-react";

export function TicketVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const dataParam = searchParams.get("data");

      if (!dataParam) {
        setError("Không tìm thấy dữ liệu vé trong đường dẫn.");
        return;
      }

      const decodedString = decodeURIComponent(atob(dataParam));
      const parsedData = JSON.parse(decodedString);
      setTicketData(parsedData);
    } catch (err) {
      console.error("Failed to parse ticket data:", err);
      setError("Dữ liệu vé không hợp lệ hoặc đã bị hỏng.");
    }
  }, [location]);

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

  const eventDate = ticketData.event?.time ? new Date(ticketData.event.time) : new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-md w-full relative">
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>

        {/* Main Ticket Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">

          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-white drop-shadow-md" />
              </div>
              <div className="inline-block px-4 py-1.5 bg-green-500 text-white text-sm font-bold tracking-wider rounded-full uppercase shadow-md mb-4">
                {ticketData.status || "HỢP LỆ"}
              </div>
              <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md">
                {ticketData.event?.name}
              </h1>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 pb-4">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2">
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Khách hàng
                </p>
                <p className="text-lg font-bold text-slate-800">{ticketData.user?.name || "Không rõ"}</p>
                {ticketData.user?.phone && (
                  <p className="text-sm text-slate-500 font-medium">{ticketData.user.phone}</p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Ngày
                </p>
                <p className="text-base font-bold text-slate-800">
                  {eventDate.toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Giờ
                </p>
                <p className="text-base font-bold text-slate-800">
                  {eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Địa điểm
                </p>
                <p className="text-base font-bold text-slate-800 line-clamp-2">
                  {ticketData.event?.location || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative h-8 flex items-center justify-between px-2 bg-white">
            <div className="absolute left-0 w-4 h-8 bg-slate-800 rounded-r-full"></div>
            <div className="w-full border-t-2 border-dashed border-slate-300 mx-4"></div>
            <div className="absolute right-0 w-4 h-8 bg-slate-800 rounded-l-full"></div>
          </div>

          {/* Footer - Seats */}
          <div className="p-8 pt-4 bg-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5" /> Số ghế
                </p>
                <p className="text-2xl font-black text-cyan-600 tracking-wider">
                  {ticketData.seats || "Không có"}
                </p>
              </div>
              <div className="text-right">
                <Ticket className="w-10 h-10 text-slate-300 ml-auto" />
              </div>
            </div>

            <div className="text-center">
              <div className="inline-block bg-slate-200 px-4 py-2 rounded-lg">
                <p className="text-xs text-slate-500 font-mono tracking-[0.2em]">
                  {ticketData.bookingId?.substring(0, 12).toUpperCase() || "TICKET-RUSH-SYSTEM"}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">
                Phát hành bởi TicketRush
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
