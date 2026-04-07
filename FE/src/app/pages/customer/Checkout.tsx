import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CustomerLayout } from "../../components/CustomerLayout";
import { CountdownTimer } from "../../components/CountdownTimer";
import { store } from "../../store";
import { Booking, Ticket } from "../../types";
import { CheckCircle, MapPin, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function Checkout() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(store.getCurrentBooking());
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate("/");
    }
  }, [booking, navigate]);

  const handleTimeout = () => {
    toast.error("Hết thời gian giữ chỗ!");
    store.clearBooking();
    navigate(`/event/${booking?.eventId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create tickets
    if (booking) {
      const event = store.getEvent(booking.eventId);
      booking.seats.forEach((seat) => {
        const ticket: Ticket = {
          id: `ticket-${Date.now()}-${Math.random()}`,
          eventId: booking.eventId,
          eventName: booking.eventName,
          venue: event?.venue || "",
          date: event?.date || "",
          time: event?.time || "",
          seatLabel: seat.label,
          zone: seat.zone,
          price: seat.price,
          qrCode: `TICKET-${Date.now()}-${seat.id}`,
        };
        store.addTicket(ticket);
      });

      // Update seat status to sold
      booking.seats.forEach((seat) => {
        store.updateSeatStatus(booking.eventId, seat.id, "sold");
      });

      store.clearBooking();
      setIsProcessing(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate("/my-tickets");
      }, 3000);
    }
  };

  if (!booking) return null;

  if (showSuccess) {
    return (
      <CustomerLayout showNav={false}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-6">
              Vé của bạn đã được tạo và lưu vào "Vé của tôi"
            </p>
            <div className="text-sm text-gray-500">
              Đang chuyển hướng...
            </div>
          </motion.div>
        </div>
      </CustomerLayout>
    );
  }

  const event = store.getEvent(booking.eventId);

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Thanh toán</h1>
          <CountdownTimer
            targetDate={booking.expiresAt}
            onExpire={handleTimeout}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Thông tin người nhận vé</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📧 Vé điện tử sẽ được gửi đến email của bạn sau khi thanh toán thành công.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Đang xử lý...
                  </span>
                ) : (
                  "XÁC NHẬN THANH TOÁN"
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h3>

              {event && (
                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-bold mb-3">{booking.eventName}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-medium mb-3">Danh sách ghế:</h4>
                <div className="space-y-2">
                  {booking.seats.map((seat) => (
                    <div
                      key={seat.id}
                      className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">{seat.label}</span>
                      <span className="text-blue-600">
                        {seat.price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-medium">{booking.seats.length} vé</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {booking.total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Vui lòng hoàn tất thanh toán trước khi hết thời gian để giữ ghế của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
