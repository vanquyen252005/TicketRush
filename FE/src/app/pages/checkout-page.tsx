import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Clock, CreditCard, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { eventService } from "../services/event-service";
import { bookingService } from "../services/booking-service";
import { paymentService } from "../services/payment-service";
import { Booking, PaymentTransaction } from "../types";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { QRCodeSVG } from "qrcode.react";
import {
  buildTicketQrPayload,
  buildTicketQrReceiptText,
  buildTicketVerifyUrl,
} from "../utils/ticket-qr";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { bookingId?: string } | null;
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get("bookingId") || state?.bookingId;
  const { user } = useAuth();

  const [timeLeft, setTimeLeft] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentTransaction, setPaymentTransaction] = useState<PaymentTransaction | null>(null);
  const [transactionReady, setTransactionReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!bookingId) return;
        setTransactionReady(false);
        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);

        const data = await eventService.getEventById(Number(bookingData.event_id));
        setEvent(data);

        if (bookingData.status === "CONFIRMED") {
          try {
            const transactionData = await paymentService.getTransactionByBookingId(bookingData.id);
            setPaymentTransaction(transactionData);
          } catch (transactionError) {
            console.error("Lỗi khi tải thông tin giao dịch:", transactionError);
            setPaymentTransaction(null);
          }
        } else {
          setPaymentTransaction(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải sự kiện:", error);
      } finally {
        setTransactionReady(true);
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) {
      return;
    }

    if (booking.status === "CONFIRMED") {
      if (transactionReady) {
        setShowSuccess(true);
      }
      return;
    }

    if (booking.status !== "PENDING" || !booking.expires_at) {
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(booking.expires_at).getTime() - Date.now()) / 1000)
      );
      setTimeLeft(diff);

      if (diff <= 0) {
        alert("Hết thời gian giữ chỗ!");
        navigate(`/event/${booking.event_id}`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [booking, transactionReady, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Đang tải thông tin thanh toán...</h2>
      </div>
    );
  }

  if (!bookingId || !booking || !event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Không có thông tin đặt vé
        </h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const zones = event.zones ?? [];
  const seatIndex = zones.flatMap((zone: any) =>
    (zone.seats ?? []).map((seat: any) => ({ zone, seat }))
  );
  const selectedSeats = (booking.items ?? []).map((item) => {
    const match = seatIndex.find((entry: any) => entry.seat.id === item.seat_id);
    return match ? { ...match, item } : null;
  }).filter(Boolean) as Array<{ zone: any; seat: any; item: NonNullable<Booking["items"]>[number] }>;
  const totalAmount = booking.total_amount || selectedSeats.reduce((sum, entry) => {
    return sum + (entry.item.price_at_purchase || entry.zone.base_price || 0);
  }, 0);
  const canSubmitPayment = booking.status === "PENDING";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePayment = async () => {
    if (!canSubmitPayment) {
      toast.error("Đơn hàng đã được xử lý");
      return;
    }

    setIsProcessing(true);
    setTransactionReady(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const updatedBooking = await bookingService.confirmBooking(booking.id);
      try {
        const transactionData = await paymentService.getTransactionByBookingId(updatedBooking.id);
        setBooking(updatedBooking);
        setPaymentTransaction(transactionData);
      } catch (transactionError) {
        console.error("Lỗi khi tải thông tin giao dịch:", transactionError);
        setBooking(updatedBooking);
        setPaymentTransaction(null);
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as any)?.error || (error.response?.data as any)?.message || error.message
        : "Không thể xác nhận thanh toán";
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setTransactionReady(true);
    }
  };

  if (showSuccess) {
    const qrPayload = buildTicketQrPayload({
      booking,
      event,
      seats: selectedSeats.map((seat) => `${seat.seat.row_label}${seat.seat.seat_number}`),
      user,
      transaction: paymentTransaction,
    });
    const verifyUrl = buildTicketVerifyUrl(qrPayload);
    const qrData = buildTicketQrReceiptText(qrPayload);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50 py-12">
        <div className="text-center w-full max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/30">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Thanh toán thành công!
          </h1>

          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 w-full">
              <QRCodeSVG value={qrData} size={200} level="M" className="mx-auto" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Mã xác nhận đơn hàng</p>
            <p className="text-xs text-slate-500 mt-1 text-center">
              Quét mã để xem thông tin đơn hàng và giao dịch trên điện thoại.
            </p>
            {!paymentTransaction && (
              <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Chưa tải được chi tiết giao dịch, QR vẫn hiển thị thông tin đơn hàng.
              </div>
            )}
            {verifyUrl && (
              <a
                href={verifyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 transition-colors"
              >
                Mở trang xác minh
              </a>
            )}
          </div>

          <button
            onClick={() => navigate("/my-tickets")}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20"
          >
            Trở về xem vé của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Timer Warning */}
        <div className={`mb-6 p-4 rounded-xl border-2 flex items-center justify-center gap-3 ${timeLeft < 60
            ? 'bg-red-50 border-red-300 text-red-700'
            : 'bg-yellow-50 border-yellow-300 text-yellow-700'
          }`}>
          <Clock className="w-5 h-5" />
          <span className="font-semibold">
            Thời gian giữ chỗ còn: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Thông tin đặt vé
              </h2>

              {/* Event Info */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-bold text-lg text-slate-800 mb-3">
                  {event?.name}
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event?.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event?.startTime || event?.start_time || '').toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Selected Seats */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Ghế đã chọn
                </h3>
                <div className="space-y-2">
                  {selectedSeats.map((seat) => {
                    const zone = seat.zone;
                    return (
                      <div key={seat.item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: zone?.color_hex }}
                          ></div>
                          <span className="font-medium">
                            {zone?.name} - Ghế {seat.seat.row_label}{seat.seat.seat_number}
                          </span>
                        </div>
                        <span className="font-bold text-cyan-600">
                          {seat.item.price_at_purchase.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info Form */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">
                  Thông tin người nhận vé
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      placeholder="0123456789"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <h3 className="text-xl font-bold text-slate-800">
                Tóm tắt thanh toán
              </h3>

              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tổng tiền vé</span>
                  <span className="font-semibold">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Phí dịch vụ</span>
                  <span className="font-semibold">0đ</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800 font-semibold">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-cyan-600">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Phương thức thanh toán
                </h4>

                <button className="w-full p-3 border-2 border-cyan-500 bg-cyan-50 rounded-lg text-left hover:bg-cyan-100 transition-colors">
                  <div className="font-semibold text-cyan-700">VNPay</div>
                  <div className="text-xs text-cyan-600">Ví điện tử VNPay</div>
                </button>

                <button className="w-full p-3 border-2 border-slate-200 rounded-lg text-left hover:bg-slate-50 transition-colors">
                  <div className="font-semibold text-slate-700">Momo</div>
                  <div className="text-xs text-slate-500">Ví điện tử Momo</div>
                </button>

                <button className="w-full p-3 border-2 border-slate-200 rounded-lg text-left hover:bg-slate-50 transition-colors">
                  <div className="font-semibold text-slate-700">Thẻ tín dụng</div>
                  <div className="text-xs text-slate-500">Visa, Mastercard</div>
                </button>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || !canSubmitPayment}
                className={`w-full py-4 rounded-xl text-white font-semibold transition-all ${isProcessing || !canSubmitPayment
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg'
                  }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Đang xử lý...
                  </span>
                ) : !canSubmitPayment ? (
                  'Đơn hàng đã được xử lý'
                ) : (
                  'Xác nhận thanh toán'
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Bằng cách thanh toán, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
