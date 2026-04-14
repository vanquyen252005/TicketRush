import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Clock, CreditCard, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { mockEvents, mockZones, generateSeats } from "../data/utils";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId, seatIds } = location.state || {};
  
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Hết thời gian giữ chỗ!");
      navigate(`/event/${eventId}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate, eventId]);

  if (!eventId || !seatIds || seatIds.length === 0) {
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

  const event = mockEvents.find(e => e.id === eventId);
  const zones = mockZones.filter(z => z.event_id === eventId);
  const allSeats = zones.flatMap(zone => generateSeats(zone.id, 5, 10));
  const selectedSeats = allSeats.filter(s => seatIds.includes(s.id));
  const totalAmount = selectedSeats.reduce((sum, seat) => {
    const zone = zones.find(z => z.id === seat.zone_id);
    return sum + (zone?.base_price || 0);
  }, 0);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setShowSuccess(true);
    
    // Redirect to success page after 3 seconds
    setTimeout(() => {
      navigate("/my-tickets");
    }, 3000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Đặt vé thành công!
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Vé điện tử đã được gửi về email của bạn
          </p>
          <div className="inline-flex items-center gap-2 text-slate-600">
            <div className="animate-spin w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full"></div>
            <span>Đang chuyển hướng...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Timer Warning */}
        <div className={`mb-6 p-4 rounded-xl border-2 flex items-center justify-center gap-3 ${
          timeLeft < 60 
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
                    <span>{new Date(event?.start_time || '').toLocaleDateString('vi-VN')}</span>
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
                    const zone = zones.find(z => z.id === seat.zone_id);
                    return (
                      <div key={seat.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: zone?.color_hex }}
                          ></div>
                          <span className="font-medium">
                            {zone?.name} - Ghế {seat.row_label}{seat.seat_number}
                          </span>
                        </div>
                        <span className="font-bold text-cyan-600">
                          {zone?.base_price.toLocaleString('vi-VN')}đ
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
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl text-white font-semibold transition-all ${
                  isProcessing
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Đang xử lý...
                  </span>
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
