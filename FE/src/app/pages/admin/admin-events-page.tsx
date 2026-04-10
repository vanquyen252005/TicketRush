import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit, Trash2, Settings, MapPin, Calendar, Loader2, AlertCircle } from "lucide-react";
import { eventService } from "../../services/event-service";
import { Event } from "../../data/mock-data";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        // Fallback to empty array or keep current state
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SELLING':
        return 'bg-green-100 text-green-700';
      case 'COMING_SOON':
        return 'bg-yellow-100 text-yellow-700';
      case 'SOLD_OUT':
        return 'bg-red-100 text-red-700';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SELLING':
        return 'Đang bán';
      case 'COMING_SOON':
        return 'Sắp diễn ra';
      case 'SOLD_OUT':
        return 'Hết vé';
      case 'COMPLETED':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Quản lý Sự kiện
            </h1>
            <p className="text-slate-600">
              Tạo và quản lý tất cả sự kiện của bạn
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo sự kiện mới</span>
          </button>
        </div>

        {/* Search Bar */}
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
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
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

      {/* Events Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.start_time);
            
            return (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
              >
                {/* Event Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
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

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/events/${event.id}/seats`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-semibold">Sơ đồ ghế</span>
                    </Link>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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

      {/* Create Event Modal */}
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
              Tạo sự kiện mới
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên sự kiện
                </label>
                <input
                  type="text"
                  placeholder="VD: Monsoon Music Festival 2026"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ảnh sự kiện (URL)
                </label>
                <input
                  type="url"
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
                  Tạo sự kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
