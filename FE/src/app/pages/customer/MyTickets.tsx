import { useState, useEffect } from "react";
import { CustomerLayout } from "../../components/CustomerLayout";
import { store } from "../../store";
import { Ticket } from "../../types";
import { MapPin, Calendar, Clock, Maximize2, X } from "lucide-react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "motion/react";

export default function MyTickets() {
  const [tickets] = useState<Ticket[]>(store.getTickets());
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    // Increase brightness when QR code is shown (mobile simulation)
    if (selectedTicket) {
      document.body.style.filter = "brightness(1.2)";
    } else {
      document.body.style.filter = "";
    }

    return () => {
      document.body.style.filter = "";
    };
  }, [selectedTicket]);

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Vé của tôi</h1>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              Chưa có vé nào
            </h2>
            <p className="text-gray-500">
              Vé của bạn sẽ xuất hiện ở đây sau khi đặt thành công
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                {/* Ticket Card Design */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">
                          {ticket.eventName}
                        </h3>
                      </div>
                      <Maximize2 className="w-5 h-5 ml-2" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{ticket.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ticket.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{ticket.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforation */}
                  <div className="relative h-4 bg-white">
                    <div className="absolute -top-2 left-0 w-4 h-4 bg-gray-50 rounded-full" />
                    <div className="absolute -top-2 right-0 w-4 h-4 bg-gray-50 rounded-full" />
                    <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-gray-300" />
                  </div>

                  {/* Ticket Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Ghế</div>
                        <div className="text-xl font-bold text-blue-600">
                          {ticket.seatLabel}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Khu vực</div>
                        <div className="text-lg font-bold">{ticket.zone}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-500 mb-1">Giá vé</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {ticket.price.toLocaleString("vi-VN")}đ
                      </div>
                    </div>

                    {/* Mini QR Preview */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-center">
                      <QRCode value={ticket.qrCode} size={80} />
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-2">
                      Click để xem QR code
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Vé điện tử</h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-lg mb-2">{selectedTicket.eventName}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedTicket.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(selectedTicket.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedTicket.time}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Ghế</div>
                    <div className="text-xl font-bold text-blue-600">
                      {selectedTicket.seatLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Khu vực</div>
                    <div className="text-xl font-bold">{selectedTicket.zone}</div>
                  </div>
                </div>
              </div>

              {/* Large QR Code */}
              <div className="bg-white p-6 rounded-xl border-4 border-blue-600 mb-4">
                <div className="flex justify-center">
                  <QRCode value={selectedTicket.qrCode} size={256} />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Mã vé: {selectedTicket.id}
                </p>
                <p className="text-xs text-gray-500">
                  Vui lòng xuất trình QR code này tại cổng vào
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CustomerLayout>
  );
}
