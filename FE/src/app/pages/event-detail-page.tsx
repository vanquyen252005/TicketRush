import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { MapPin, Calendar, Clock, ArrowLeft, Info, Armchair } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { SeatSelector } from "../components/seat-selector";
import { eventService } from "../services/event-service";
import { bookingService } from "../services/booking-service";
import { useAuth } from "../hooks/use-auth";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Event } from "../types";

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [event, setEvent] = useState<Event | null>(() => {
    return (location.state as { event?: Event } | null)?.event ?? null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    return !(location.state as { event?: Event } | null)?.event;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const routeEvent = (location.state as { event?: Event } | null)?.event ?? null;
    if (routeEvent) {
      setEvent(routeEvent);
      setIsLoading(false);
    } else {
      setEvent(null);
      setIsLoading(true);
    }

    let isActive = true;

    const fetchEvent = async () => {
      try {
        if (!id) return;
        const data = await eventService.getEventById(Number(id));
        if (!isActive) {
          return;
        }

        setEvent((current) => {
          if (!current) {
            return data;
          }

          return {
            ...current,
            ...data,
            zones: data.zones ?? current.zones,
          };
        });
      } catch (error) {
        console.error("Lỗi khi tải sự kiện:", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      isActive = false;
    };
  }, [id, location.state]);

  const zones = event?.zones ?? [];
  const isBookable = event?.status === "PUBLISHED" || event?.status === "SELLING";
  const seatIndex = zones.flatMap((zone: any) =>
    (zone.seats ?? []).map((seat: any) => ({ zone, seat }))
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
      case "SELLING":
        return "bg-green-500";
      case "COMING_SOON":
        return "bg-yellow-500";
      case "SOLD_OUT":
        return "bg-red-500";
      case "CANCELLED":
        return "bg-slate-500";
      default:
        return "bg-cyan-500";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
      case "SELLING":
        return "Đang bán";
      case "COMING_SOON":
        return "Sắp mở bán";
      case "SOLD_OUT":
        return "Hết vé";
      case "CANCELLED":
        return "Đã hủy";
      case "DRAFT":
        return "Bản nháp";
      case "COMPLETED":
        return "Đã kết thúc";
      default:
        return "Sự kiện";
    }
  };

  const selectedSeatDetails = selectedSeats
    .map((seatId) => seatIndex.find((entry: any) => entry.seat.id === seatId))
    .filter(Boolean);

  const totalAmount = selectedSeatDetails.reduce((sum: number, entry: any) => {
    return sum + (entry?.zone?.base_price || 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Đang tải thông tin sự kiện...</h2>
      </div>
    );
  }

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

  const eventDate = new Date(event.startTime || event.start_time);

  const handleProceedToCheckout = async () => {
    if (!isBookable) {
      toast.error("Sự kiện hiện chưa mở bán");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để giữ ghế");
      return;
    }

    if (selectedSeats.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = await bookingService.holdSeats({
        eventId: event.id,
        seatIds: selectedSeats,
      });

      navigate(`/checkout?bookingId=${booking.id}`, {
        state: { bookingId: booking.id },
      });
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as any)?.error || (error.response?.data as any)?.message || error.message
        : "Không thể giữ ghế, vui lòng thử lại";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={event.imageUrl || event.image} 
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
          
          <div className={`inline-block px-3 py-1 rounded-full text-xs text-white mb-3 w-fit ${getStatusBadge(event.status)}`}>
            {getStatusLabel(event.status)}
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
              
              {zones.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  Sự kiện này chưa có sơ đồ ghế từ backend.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {zones.map((zone: any) => (
                      <div 
                        key={zone.id}
                        className="border-2 rounded-xl p-4 hover:border-cyan-500 transition-colors"
                        style={{ borderColor: (zone.available ?? 1) === 0 ? '#e2e8f0' : `${zone.color_hex}40` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: zone.color_hex }}
                            ></div>
                            <h3 className="font-bold text-slate-800">{zone.name}</h3>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-cyan-600 mb-2">
                          {zone.base_price.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-sm text-slate-500">
                          Sức chứa: {zone.capacity} ghế
                        </p>
                        <p className="text-sm text-slate-500">
                          Còn lại: {zone.available ?? 0} ghế
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
                </>
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
                    {selectedSeatDetails.map((entry: any) => (
                      <div key={entry.seat.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {entry.zone.name} - Ghế {entry.seat.row_label}{entry.seat.seat_number}
                        </span>
                        <span className="font-semibold">
                          {entry.zone.base_price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-600">Tổng cộng</span>
                      <span className="text-2xl font-bold text-cyan-600">
                        {totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <button
                      onClick={handleProceedToCheckout}
                      disabled={isSubmitting || !isBookable}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Đang giữ ghế..." : "Tiếp tục thanh toán"}
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
