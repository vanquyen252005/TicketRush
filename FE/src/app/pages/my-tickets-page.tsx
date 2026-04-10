import { useState } from "react";
import { Ticket, MapPin, Calendar, Clock, QrCode, X } from "lucide-react";
import { mockBookings } from "../data/mock-data";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function MyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNUSED':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Chưa sử dụng
          </span>
        );
      case 'USED':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            Đã sử dụng
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            Đã hoàn
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Vé của tôi
          </h1>
          <p className="text-slate-600">
            Quản lý tất cả vé điện tử của bạn
          </p>
        </div>

        {mockBookings.length === 0 ? (
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
            <a
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700"
            >
              Khám phá sự kiện
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockBookings.map((booking) => {
              const eventDate = new Date(booking.event_date);
              
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
                          {booking.event_name}
                        </h3>
                        <div className="space-y-1 text-cyan-50 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.location}</span>
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
                      {getStatusBadge(booking.check_in_status)}
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-600 mb-2">
                        Ghế đã đặt
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats.map((seat, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-semibold"
                          >
                            {seat.zone} - {seat.row}{seat.number}
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

                    <button
                      onClick={() => setSelectedTicket(booking.id)}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Xem mã QR</span>
                    </button>

                    <div className="mt-3 text-center">
                      <span className="text-xs text-slate-500">
                        Mã vé: {booking.ticket_code}
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
        {selectedTicket && (
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
                  <img
                    src={mockBookings.find(b => b.id === selectedTicket)?.qr_code}
                    alt="QR Code"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-slate-600">
                  Vui lòng xuất trình mã QR này tại cổng
                </p>
                <p className="font-mono font-bold text-cyan-600 text-lg">
                  {selectedTicket}
                </p>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ Tăng độ sáng màn hình để máy quét dễ đọc mã
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
