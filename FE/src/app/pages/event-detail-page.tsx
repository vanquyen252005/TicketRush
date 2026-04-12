import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  Info,
  Armchair,
  Loader2,
} from "lucide-react";
import { Event, mockZones, generateSeats } from "../data/mock-data";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { SeatSelector } from "../components/seat-selector";
import { eventService } from "../services/event-service";

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showSeatMap, setShowSeatMap] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError("Khong co ma su kien.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await eventService.getEventById(id);
        setEvent(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load event", err);
        setError("Khong tim thay su kien hoac backend chua san sang.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
          <span>Dang tai du lieu su kien...</span>
        </div>
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {error ?? "Khong tim thay su kien"}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-white hover:bg-cyan-700"
        >
          Ve trang chu
        </button>
      </div>
    );
  }

  const eventDate = new Date(event.start_time);
  const zones = mockZones.filter((z) => z.event_id === event.id);

  const handleProceedToCheckout = () => {
    if (selectedSeats.length > 0) {
      navigate("/checkout", { state: { eventId: event.id, seatIds: selectedSeats } });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-[400px] overflow-hidden">
        <img src={event.image} alt={event.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

        <div className="absolute inset-0 container mx-auto flex flex-col justify-end px-4 pb-12">
          <button
            onClick={() => navigate("/")}
            className="mb-4 inline-flex w-fit items-center gap-2 text-white transition-colors hover:text-cyan-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lai</span>
          </button>

          <div className="mb-3 inline-block w-fit rounded-full bg-cyan-500 px-3 py-1 text-xs text-white">
            {event.category}
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-white">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{format(eventDate, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{format(eventDate, "HH:mm", { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-slate-800">
                <Info className="h-6 w-6 text-cyan-600" />
                Thong tin su kien
              </h2>
              <p className="leading-relaxed text-slate-600">{event.description}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-800">
                <Armchair className="h-6 w-6 text-cyan-600" />
                Chon khu vuc va ghe ngoi
              </h2>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="rounded-xl border-2 p-4 transition-colors hover:border-cyan-500"
                    style={{ borderColor: zone.available === 0 ? "#e2e8f0" : `${zone.color_hex}40` }}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: zone.color_hex }}
                        ></div>
                        <h3 className="font-bold text-slate-800">{zone.name}</h3>
                      </div>
                      {zone.available === 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                          Het ve
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-2xl font-bold text-cyan-600">
                      {zone.base_price.toLocaleString("vi-VN")}d
                    </p>
                    <p className="text-sm text-slate-500">
                      Con {zone.available}/{zone.capacity} ghe
                    </p>
                  </div>
                ))}
              </div>

              {!showSeatMap ? (
                <button
                  onClick={() => setShowSeatMap(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-4 text-white transition-all hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg"
                >
                  Chon ghe tren so do
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

          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-cyan-100 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-slate-800">Don hang cua ban</h3>

              {selectedSeats.length === 0 ? (
                <div className="py-8 text-center">
                  <Armchair className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                  <p className="text-sm text-slate-500">Chua co ghe nao duoc chon</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedSeats.map((seatId) => {
                      const allSeats = zones.flatMap((zone) =>
                        generateSeats(zone.id, 5, 10).filter((s) => s.id === seatId),
                      );
                      const seat = allSeats[0];
                      if (!seat) {
                        return null;
                      }

                      const zone = zones.find((z) => z.id === seat.zone_id);

                      return (
                        <div key={seatId} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {zone?.name} - Ghe {seat.row_label}
                            {seat.seat_number}
                          </span>
                          <span className="font-semibold">
                            {seat.price.toLocaleString("vi-VN")}d
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-slate-600">Tong cong</span>
                      <span className="text-2xl font-bold text-cyan-600">
                        {selectedSeats
                          .reduce((sum, seatId) => {
                            const allSeats = zones.flatMap((zone) =>
                              generateSeats(zone.id, 5, 10).filter((s) => s.id === seatId),
                            );
                            const seat = allSeats[0];
                            return sum + (seat?.price || 0);
                          }, 0)
                          .toLocaleString("vi-VN")}
                        d
                      </span>
                    </div>

                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-white transition-all hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg"
                    >
                      Tiep tuc thanh toan
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
