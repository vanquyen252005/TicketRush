import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Settings,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { eventService } from "../../services/event-service";
import { Event } from "../../data/mock-data";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Khong the tai danh sach su kien. Vui long kiem tra backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event: Event) => {
    const confirmed = window.confirm(`Xoa su kien "${event.name}"? Hanh dong nay khong the hoan tac.`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(event.id);
      await eventService.deleteEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setError(null);
    } catch (err) {
      console.error("Failed to delete event:", err);
      setError("Khong xoa duoc su kien. Vui long thu lai.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SELLING":
        return "bg-green-100 text-green-700";
      case "COMING_SOON":
        return "bg-yellow-100 text-yellow-700";
      case "SOLD_OUT":
        return "bg-red-100 text-red-700";
      case "COMPLETED":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SELLING":
        return "Dang ban";
      case "DRAFT":
        return "Ban nhap";
      case "COMING_SOON":
        return "Sap dien ra";
      case "SOLD_OUT":
        return "Het ve";
      case "COMPLETED":
        return "Da ket thuc";
      default:
        return status;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-800">Quan ly su kien</h1>
            <p className="text-slate-600">Tao va quan ly tat ca su kien cua ban</p>
          </div>
          <Link
            to="/admin/events/create"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-white transition-all hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Tao su kien moi</span>
          </Link>
        </div>

        <div className="flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tim kiem su kien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-cyan-600" />
          <p className="font-medium text-slate-600">Dang tai du lieu...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-bold text-red-800">Loi ket noi</h3>
          <p className="mb-4 text-red-700">{error}</p>
          <button
            onClick={() => void loadEvents()}
            className="rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
          >
            Thu lai
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.start_time);

            return (
              <div
                key={event.id}
                className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(event.status)}`}
                    >
                      {getStatusText(event.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-800">
                    {event.name}
                  </h3>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{format(eventDate, "dd/MM/yyyy - HH:mm", { locale: vi })}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/admin/events/${event.id}/seats`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-50 px-4 py-2 text-cyan-700 transition-colors hover:bg-cyan-100"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-semibold">So do ghe</span>
                    </Link>
                    <Link
                      to={`/admin/events/${event.id}/edit`}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => void handleDelete(event)}
                      disabled={deletingId === event.id}
                      className="rounded-lg bg-red-50 px-4 py-2 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && filteredEvents.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <Search className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-slate-700">Khong tim thay su kien</h3>
          <p className="text-slate-500">Thu tim kiem voi tu khoa khac</p>
        </div>
      )}
    </div>
  );
}
