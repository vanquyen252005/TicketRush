import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { CustomerLayout } from "../../components/CustomerLayout";
import { SeatComponent } from "../../components/SeatComponent";
import { CountdownTimer } from "../../components/CountdownTimer";
import { store } from "../../store";
import { Seat } from "../../types";
import { MapPin, Calendar, Clock, Info, AlertCircle, Ticket, Users } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = eventId ? store.getEvent(eventId) : null;

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("VIP");
  const [bookingExpiry, setBookingExpiry] = useState<number | null>(null);
  const seatSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSeatSection = () => {
    seatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFixedCta = () => {
    if (selectedSeats.length > 0) {
      handleCheckout();
    } else {
      scrollToSeatSection();
    }
  };

  useEffect(() => {
    if (!event || !eventId) {
      navigate("/");
      return;
    }

    const allSeats = store.getSeats(eventId);
    setSeats(allSeats);

    // Simulate real-time seat updates
    const interval = setInterval(() => {
      const randomSeat = allSeats[Math.floor(Math.random() * allSeats.length)];
      if (randomSeat.status === "available" && Math.random() < 0.05) {
        store.updateSeatStatus(eventId, randomSeat.id, "locked");
        setSeats([...store.getSeats(eventId)]);
        toast.error(`Ghế ${randomSeat.label} vừa được người khác chọn`);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [eventId, event, navigate]);

  const handleSeatClick = (seat: Seat) => {
    if (!eventId) return;

    if (seat.status === "selected") {
      // Deselect
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
      store.updateSeatStatus(eventId, seat.id, "available");
      setSeats([...store.getSeats(eventId)]);
    } else if (seat.status === "available") {
      // Simulate race condition
      if (Math.random() < 0.1) {
        // 10% chance of failure
        toast.error(`Ghế ${seat.label} vừa được người khác chọn`);
        store.updateSeatStatus(eventId, seat.id, "locked");
        setSeats([...store.getSeats(eventId)]);
        return;
      }

      // Success
      setSelectedSeats([...selectedSeats, seat]);
      store.updateSeatStatus(eventId, seat.id, "selected");
      setSeats([...store.getSeats(eventId)]);

      if (!bookingExpiry) {
        setBookingExpiry(Date.now() + 10 * 60 * 1000); // 10 minutes
      }

      toast.success(`Đã chọn ghế ${seat.label}`);
    }
  };

  function handleCheckout() {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế");
      return;
    }

    if (eventId) {
      store.createBooking(eventId, selectedSeats);
      navigate("/checkout");
    }
  }

  const handleTimeout = () => {
    toast.error("Hết thời gian giữ chỗ!");
    // Release seats
    if (eventId) {
      selectedSeats.forEach((seat) => {
        store.updateSeatStatus(eventId, seat.id, "available");
      });
    }
    setSelectedSeats([]);
    setBookingExpiry(null);
    setSeats([...store.getSeats(eventId || "")]);
  };

  if (!event) return null;

  const zones = ["VIP", "Zone A", "Zone B"];
  const zoneSeats = seats.filter((seat) => seat.zone === selectedZone);
  const maxRow =
    zoneSeats.length === 0 ? 0 : Math.max(...zoneSeats.map((s) => s.row));
  const maxCol =
    zoneSeats.length === 0 ? 0 : Math.max(...zoneSeats.map((s) => s.col));

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const remainingSeats = Math.max(0, event.totalSeats - event.soldSeats);

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {/* Event Header — thông tin sự kiện */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="md:col-span-2 flex flex-col gap-4 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`
                    inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                    ${
                      event.status === "open"
                        ? "bg-green-100 text-green-800"
                        : event.status === "soldout"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }
                  `}
                >
                  {event.status === "open"
                    ? "Đang mở bán"
                    : event.status === "soldout"
                      ? "Hết vé"
                      : "Sắp mở bán"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 shrink-0 text-blue-600" />
                  <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 shrink-0 text-blue-600" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 shrink-0 text-blue-600" />
                  <span>
                    {event.price.min.toLocaleString("vi-VN")}đ –{" "}
                    {event.price.max.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Users className="w-5 h-5 shrink-0 text-blue-600" />
                  <span>
                    Còn {remainingSeats.toLocaleString("vi-VN")} /{" "}
                    {event.totalSeats.toLocaleString("vi-VN")} ghế
                  </span>
                </div>
              </div>
              {String(event.content ?? "").trim() ? (
                <div className="pt-2 border-t border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Giới thiệu
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {event.content}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map — đặt chỗ / chọn ghế */}
          <div
            ref={seatSectionRef}
            id="khu-dat-cho"
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 scroll-mt-24"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Chọn ghế</h2>
              {bookingExpiry && (
                <CountdownTimer
                  targetDate={bookingExpiry}
                  onExpire={handleTimeout}
                />
              )}
            </div>

            {/* Zone Selector */}
            <div className="flex gap-2 mb-6">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      selectedZone === zone
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                  `}
                >
                  {zone}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border-2 border-blue-400 rounded-md" />
                <span className="text-sm">Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-400 border-2 border-yellow-600 rounded-md" />
                <span className="text-sm">Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 border-2 border-red-700 rounded-md" />
                <span className="text-sm">Đang giữ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 border-2 border-gray-600 rounded-md" />
                <span className="text-sm">Đã bán</span>
              </div>
            </div>

            {/* Stage */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-lg py-3 text-center font-bold text-gray-700">
                🎭 SÂN KHẤU
              </div>
            </div>

            {/* Seat Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {Array.from({ length: maxRow }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 mb-1 justify-center">
                    <div className="w-8 flex items-center justify-center text-sm font-medium text-gray-600">
                      {String.fromCharCode(65 + rowIndex)}
                    </div>
                    {Array.from({ length: maxCol }, (_, colIndex) => {
                      const seat = zoneSeats.find(
                        (s) => s.row === rowIndex + 1 && s.col === colIndex + 1
                      );
                      return seat ? (
                        <SeatComponent
                          key={seat.id}
                          seat={seat}
                          onClick={handleSeatClick}
                        />
                      ) : (
                        <div key={`empty-${rowIndex}-${colIndex}`} className="w-8 h-8" />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Màu đỏ: Ghế đang được người khác giữ (cập nhật real-time)</li>
                    <li>Bạn có 10 phút để hoàn tất thanh toán</li>
                    <li>Ghế sẽ tự động được giải phóng nếu hết thời gian</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Tóm tắt đặt chỗ</h3>

              <AnimatePresence>
                {selectedSeats.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-gray-400"
                  >
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>Chưa có ghế nào được chọn</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                      {selectedSeats.map((seat) => (
                        <div
                          key={seat.id}
                          className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{seat.label}</div>
                            <div className="text-sm text-gray-600">{seat.zone}</div>
                          </div>
                          <div className="font-bold text-blue-600">
                            {seat.price.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Số lượng ghế:</span>
                        <span className="font-medium">{selectedSeats.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {totalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                    >
                      Thanh toán
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Nút cố định góc phải: cuốn tới chọn ghế hoặc thanh toán */}
      <button
        type="button"
        onClick={handleFixedCta}
        className="fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 text-white text-sm sm:text-base font-semibold shadow-lg shadow-blue-600/25 hover:from-blue-700 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={
          selectedSeats.length > 0 ? "Thanh toán" : "Đặt vé — chuyển tới chọn ghế"
        }
      >
        <Ticket className="w-5 h-5 shrink-0" />
        {selectedSeats.length > 0 ? "Thanh toán" : "Đặt vé"}
      </button>
    </CustomerLayout>
  );
}
