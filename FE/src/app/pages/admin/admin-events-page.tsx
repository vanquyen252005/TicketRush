import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
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
  X,
  RefreshCw,
  Armchair,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { eventService } from "../../services/event-service";
import { Event, Seat, Zone } from "../../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "../../hooks/use-auth";

type SeatSummary = {
  total: number;
  available: number;
  locked: number;
  booked: number;
};

const sortSeats = (seats: Seat[]) =>
  [...seats].sort((a, b) => {
    const rowCompare = a.row_label.localeCompare(b.row_label, undefined, { numeric: true, sensitivity: "base" });
    if (rowCompare !== 0) {
      return rowCompare;
    }

    const aNumber = Number.parseInt(a.seat_number, 10);
    const bNumber = Number.parseInt(b.seat_number, 10);

    if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
      return aNumber - bNumber;
    }

    return a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true, sensitivity: "base" });
  });

const groupSeatsByRow = (seats: Seat[]) => {
  const rows = new Map<string, Seat[]>();

  sortSeats(seats).forEach((seat) => {
    const current = rows.get(seat.row_label) ?? [];
    rows.set(seat.row_label, [...current, seat]);
  });

  return Array.from(rows.entries()).map(([row, rowSeats]) => ({
    row,
    seats: rowSeats,
  }));
};

const getSeatStatusMeta = (status: Seat["status"]) => {
  switch (status) {
    case "BOOKED":
      return {
        label: "Đã đặt",
        chipClass: "bg-slate-200 text-slate-700 border-slate-300",
        badgeClass: "bg-slate-800 text-white",
      };
    case "LOCKED":
      return {
        label: "Đang giữ",
        chipClass: "bg-amber-50 text-amber-700 border-amber-200",
        badgeClass: "bg-amber-500 text-white",
      };
    default:
      return {
        label: "Trống",
        chipClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        badgeClass: "bg-emerald-500 text-white",
      };
  }
};

const seatSummaryFromZones = (zones: Zone[]): SeatSummary => {
  return zones.reduce(
    (summary, zone) => {
      (zone.seats ?? []).forEach((seat) => {
        summary.total += 1;
        if (seat.status === "BOOKED") {
          summary.booked += 1;
        } else if (seat.status === "LOCKED") {
          summary.locked += 1;
        } else {
          summary.available += 1;
        }
      });

      return summary;
    },
    {
      total: 0,
      available: 0,
      locked: 0,
      booked: 0,
    }
  );
};

export function AdminEventsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [selectedLiveEventId, setSelectedLiveEventId] = useState<number | null>(null);
  const [liveEvent, setLiveEvent] = useState<Event | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<Date | null>(null);
  const [liveRefreshTick, setLiveRefreshTick] = useState(0);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await eventService.getAllEvents();
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Không thể tải danh sách sự kiện. Vui lòng kiểm tra kết nối Backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedLiveEventId) {
      setLiveEvent(null);
      setLiveError(null);
      setLiveUpdatedAt(null);
      return;
    }

    let isActive = true;

    const fetchLiveEvent = async (background = false) => {
      if (background) {
        setIsLiveRefreshing(true);
      } else {
        setIsLiveLoading(true);
      }

      try {
        const data = await eventService.getEventById(selectedLiveEventId);
        if (!isActive) {
          return;
        }

        setLiveEvent(data);
        setLiveError(null);
        setLiveUpdatedAt(new Date());
      } catch (err) {
        console.error("Lỗi khi tải realtime seat data:", err);
        if (isActive) {
          setLiveError("Không thể tải sơ đồ ghế realtime từ backend.");
        }
      } finally {
        if (isActive) {
          setIsLiveLoading(false);
          setIsLiveRefreshing(false);
        }
      }
    };

    fetchLiveEvent();
    const timer = window.setInterval(() => {
      fetchLiveEvent(true);
    }, 8000);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [selectedLiveEventId, liveRefreshTick]);

  const handleSubmitEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setTimeError(null);

    const start_time = formData.get("start_time");
    if (start_time && typeof start_time === "string" && !editingEvent) {
      const selectedTime = new Date(start_time).getTime();
      if (selectedTime < Date.now()) {
        setTimeError("Thời gian bắt đầu phải ở hiện tại hoặc tương lai.");
        return;
      }
    }

    const formatDateTime = (val: FormDataEntryValue | null) => {
      if (!val || typeof val !== "string") return null;
      return val.length === 16 ? `${val}:00` : val;
    };

    const eventData: any = {
      name: formData.get("name"),
      description: formData.get("description"),
      location: formData.get("location"),
      startTime: formatDateTime(formData.get("start_time")),
      endTime: formatDateTime(formData.get("end_time")),
      imageUrl: formData.get("image"),
      status: formData.get("status") || "DRAFT",
    };

    try {
      let savedEvent: any;

      if (editingEvent) {
        savedEvent = await eventService.updateEvent(editingEvent.id, eventData);
        setEvents((prev) => prev.map((event) => (event.id === savedEvent.id ? savedEvent : event)));
        alert("Cập nhật thành công!");
      } else {
        savedEvent = await eventService.createEvent(eventData);
        setEvents((prev) => [savedEvent, ...prev]);
        alert("Tạo mới thành công!");
        setShowCreateModal(false);
        setEditingEvent(null);
        navigate(`/admin/events/${savedEvent.id}/seats`);
        return;
      }

      setShowCreateModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Lỗi khi lưu sự kiện:", error);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
      alert("Đã xóa sự kiện!");
    } catch (err) {
      console.error("Lỗi khi xóa sự kiện:", err);
      alert("Xóa thất bại!");
    }
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [events, searchQuery]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SELLING":
        return "bg-green-100 text-green-700";
      case "PUBLISHED":
        return "bg-cyan-100 text-cyan-700";
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
        return "Đang bán";
      case "PUBLISHED":
        return "Đã xuất bản";
      case "COMING_SOON":
        return "Sắp diễn ra";
      case "SOLD_OUT":
        return "Hết vé";
      case "COMPLETED":
        return "Đã kết thúc";
      default:
        return status;
    }
  };

  const liveSeatSummary = liveEvent?.zones ? seatSummaryFromZones(liveEvent.zones) : { total: 0, available: 0, locked: 0, booked: 0 };
  const liveZones = liveEvent?.zones ?? [];

  const closeLiveMonitor = () => {
    setSelectedLiveEventId(null);
    setLiveEvent(null);
    setLiveError(null);
    setLiveUpdatedAt(null);
    setLiveRefreshTick(0);
  };

  const openLiveMonitor = (eventId: number) => {
    setSelectedLiveEventId(eventId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        {isAdmin ? (
          <button
            onClick={() => {
              setEditingEvent(null);
              setTimeError(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo sự kiện mới</span>
          </button>
        ) : (
          <h2 className="text-2xl font-bold text-slate-800">Danh sách sự kiện</h2>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl max-w-md">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">Lỗi kết nối</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.startTime || event.start_time || Date.now());

            return (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
                onClick={() => openLiveMonitor(event.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLiveMonitor(event.id);
                  }
                }}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={event.imageUrl || event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur-sm">
                      Bấm để xem realtime
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                    {event.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(eventDate, "dd/MM/yyyy - HH:mm", { locale: vi })}</span>
                    </div>
                  </div>

                  <div
                    className="flex gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Link
                      to={`/admin/events/${event.id}/seats`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-semibold">Sơ đồ ghế</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setTimeError(null);
                            setShowCreateModal(true);
                          }}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                          title="Sửa sự kiện"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                          title="Xóa sự kiện"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Không tìm thấy sự kiện
          </h3>
          <p className="text-slate-500">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingEvent ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmitEvent}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên sự kiện
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingEvent?.name}
                  placeholder="VD: Monsoon Music Festival 2026"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  defaultValue={editingEvent?.description}
                  rows={4}
                  placeholder="Mô tả chi tiết về sự kiện..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={editingEvent?.location}
                  placeholder="VD: Công viên Yên Sở, Hà Nội"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    required
                    defaultValue={editingEvent?.startTime || editingEvent?.start_time}
                    onChange={() => {
                      if (timeError) setTimeError(null);
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${timeError ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:ring-cyan-500'}`}
                  />
                  {timeError && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {timeError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    defaultValue={editingEvent?.endTime || editingEvent?.end_time}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  defaultValue={editingEvent?.status || "DRAFT"}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  <option value="DRAFT">Bản nháp (DRAFT)</option>
                  <option value="PUBLISHED">Đã xuất bản (PUBLISHED)</option>
                  <option value="SELLING">Đang mở bán (SELLING)</option>
                  <option value="COMING_SOON">Sắp diễn ra (COMING_SOON)</option>
                  <option value="SOLD_OUT">Hết vé (SOLD_OUT)</option>
                  <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ảnh sự kiện (URL)
                </label>
                <input
                  type="url"
                  name="image"
                  defaultValue={editingEvent?.imageUrl || editingEvent?.image}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  {editingEvent ? "Lưu thay đổi" : "Tạo sự kiện"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLiveEventId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLiveMonitor}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Ghế realtime theo sự kiện
                </h3>
                <p className="text-slate-500">
                  Xem ghế đã đặt và đang giữ theo thời gian thực.
                </p>
              </div>
              <button
                onClick={closeLiveMonitor}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>

            {isLiveLoading && !liveEvent ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
              </div>
            ) : liveError && !liveEvent ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm">
                {liveError}
              </div>
            ) : liveEvent ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Sự kiện</div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-slate-800">{liveEvent.name}</div>
                      <div className="text-sm text-slate-600">{liveEvent.location}</div>
                      <div className="text-sm text-slate-500">
                        {liveEvent.startTime || liveEvent.start_time
                          ? format(new Date(liveEvent.startTime || liveEvent.start_time || Date.now()), "dd/MM/yyyy HH:mm", { locale: vi })
                          : "---"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">Trống</div>
                      <div className="text-2xl font-bold text-emerald-700">{liveSeatSummary.available}</div>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Đang giữ</div>
                      <div className="text-2xl font-bold text-amber-700">{liveSeatSummary.locked}</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Đã đặt</div>
                      <div className="text-2xl font-bold text-slate-800">{liveSeatSummary.booked}</div>
                    </div>
                    <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-1">Cập nhật</div>
                      <div className="text-sm font-semibold text-cyan-700">
                        {liveUpdatedAt ? format(liveUpdatedAt, "HH:mm:ss dd/MM/yyyy", { locale: vi }) : "---"}
                      </div>
                      <button
                        onClick={() => setLiveRefreshTick((tick) => tick + 1)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                      >
                        {isLiveRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Làm mới
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                      <span>Trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                      <span>Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
                      <span>Đã đặt</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {liveZones.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                      Sự kiện này chưa có sơ đồ ghế.
                    </div>
                  ) : (
                    liveZones.map((zone) => {
                      const zoneSeats = zone.seats ?? [];
                      const groupedRows = groupSeatsByRow(zoneSeats);

                      return (
                        <div key={zone.id} className="border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: zone.color_hex }}></div>
                              <div>
                                <div className="font-bold text-slate-800">{zone.name}</div>
                                <div className="text-sm text-slate-500">
                                  {zone.base_price.toLocaleString("vi-VN")}đ • {zone.available ?? 0}/{zone.capacity ?? zoneSeats.length} ghế trống
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-400 uppercase tracking-widest">Trạng thái zone</div>
                              <div className="text-sm font-semibold text-slate-700">{zoneSeats.length} ghế</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {groupedRows.map((row) => (
                              <div key={row.row} className="flex items-start gap-3">
                                <div className="w-8 pt-2 text-center text-sm font-bold text-slate-500">
                                  {row.row}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {row.seats.map((seat) => {
                                    const meta = getSeatStatusMeta(seat.status);

                                    return (
                                      <div
                                        key={seat.id}
                                        className={`min-w-[84px] rounded-lg border px-2.5 py-2 text-left text-xs font-semibold ${meta.chipClass}`}
                                        title={`${seat.row_label}${seat.seat_number} - ${meta.label}`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span>{seat.row_label}{seat.seat_number}</span>
                                          {seat.status === "BOOKED" ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                          ) : seat.status === "LOCKED" ? (
                                            <Clock className="w-3.5 h-3.5" />
                                          ) : (
                                            <Armchair className="w-3.5 h-3.5" />
                                          )}
                                        </div>
                                        <div className="text-[10px] font-medium mt-1 opacity-80">{meta.label}</div>
                                        {seat.status === "LOCKED" && seat.lock_expires_at && (
                                          <div className="text-[10px] font-medium mt-0.5 opacity-70">
                                            Hết hạn: {format(new Date(seat.lock_expires_at), "HH:mm:ss", { locale: vi })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
