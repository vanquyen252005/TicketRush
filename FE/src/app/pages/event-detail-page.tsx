import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { MapPin, Calendar, Clock, ArrowLeft, Info, Armchair } from "lucide-react";
import { mockEvents, mockZones, generateSeats } from "../data/mock-data";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { SeatSelector } from "../components/seat-selector";

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showSeatMap, setShowSeatMap] = useState(false);

  const event = mockEvents.find(e => e.id === Number(id));

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy sự kiện</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const eventDate = new Date(event.start_time);
  const zones = mockZones.filter(z => z.event_id === event.id);

  const handleProceedToCheckout = () => {
    if (selectedSeats.length > 0) {
      navigate("/checkout", { state: { eventId: event.id, seatIds: selectedSeats } });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={event.image} 
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-white hover:text-cyan-300 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          
          <div className="inline-block px-3 py-1 bg-cyan-500 rounded-full text-xs text-white mb-3 w-fit">
            {event.category}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {event.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(eventDate, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{format(eventDate, "HH:mm", { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-cyan-600" />
                Thông tin sự kiện
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Zone Selection */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Armchair className="w-6 h-6 text-cyan-600" />
                Chọn khu vực và ghế ngồi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {zones.map((zone) => (
                  <div 
                    key={zone.id}
                    className="border-2 rounded-xl p-4 hover:border-cyan-500 transition-colors"
                    style={{ borderColor: zone.available === 0 ? '#e2e8f0' : zone.color_hex + '40' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: zone.color_hex }}
                        ></div>
                        <h3 className="font-bold text-slate-800">{zone.name}</h3>
                      </div>
                      {zone.available === 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Hết vé
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-cyan-600 mb-2">
                      {zone.base_price.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-slate-500">
                      Còn {zone.available}/{zone.capacity} ghế
                    </p>
                  </div>
                ))}
              </div>

              {!showSeatMap ? (
                <button
                  onClick={() => setShowSeatMap(true)}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg"
                >
                  Chọn ghế trên sơ đồ
                </button>
              ) : (
                <SeatSelector
                  zones={zones}
                  selectedSeats={selectedSeats}
                  onSeatsChange={setSelectedSeats}
                />
              )}
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl shadow-lg p-6 border border-cyan-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Đơn hàng của bạn
              </h3>
              
              {selectedSeats.length === 0 ? (
                <div className="text-center py-8">
                  <Armchair className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 text-sm">
                    Chưa có ghế nào được chọn
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedSeats.map((seatId) => {
                      const allSeats = zones.flatMap(zone => 
                        generateSeats(zone.id, 5, 10).filter(s => s.id === seatId)
                      );
                      const seat = allSeats[0];
                      if (!seat) return null;
                      
                      const zone = zones.find(z => z.id === seat.zone_id);
                      
                      return (
                        <div key={seatId} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {zone?.name} - Ghế {seat.row_label}{seat.seat_number}
                          </span>
                          <span className="font-semibold">
                            {seat.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-600">Tổng cộng</span>
                      <span className="text-2xl font-bold text-cyan-600">
                        {(selectedSeats.reduce((sum, seatId) => {
                          const allSeats = zones.flatMap(zone => 
                            generateSeats(zone.id, 5, 10).filter(s => s.id === seatId)
                          );
                          const seat = allSeats[0];
                          return sum + (seat?.price || 0);
                        }, 0)).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    
                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg"
                    >
                      Tiếp tục thanh toán
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
