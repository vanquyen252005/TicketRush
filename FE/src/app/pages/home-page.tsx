import { useEffect, useState } from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Event } from "../data/mock-data";
import { EventCard } from "../components/event-card";
import { eventService } from "../services/event-service";

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const featuredEvents = events.slice(0, 3);
  const categories = ["all", ...new Set(events.map((event) => event.category))];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Nền tảng đặt vé sự kiện</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold md:text-6xl">
              Trải nghiệm sự kiện
              <br />
              <span className="bg-gradient-to-r from-cyan-200 to-yellow-200 bg-clip-text text-transparent">
                đúng nhịp của bạn
              </span>
            </h1>

            <p className="mb-8 text-xl text-cyan-50">
              Hiển thị event thật từ backend trước, rồi mới nối tiếp các luồng còn lại.
            </p>

            <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện, địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-3 text-white transition-all hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      <section className="relative z-20 -mt-16 mb-20 container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredEvents.map((event) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2 inline-block rounded-full bg-cyan-500 px-3 py-1 text-xs">
                  {event.category}
                </div>
                <h3 className="mb-2 text-xl font-bold">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-cyan-100">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto mb-12 px-4">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 py-2 transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {category === "all" ? "Tất cả" : category}
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <h2 className="mb-8 text-3xl font-bold text-slate-800">Sự kiện đang mở bán</h2>

        {isLoading ? (
          <div className="text-slate-500">Đang tải sự kiện...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-700">
              Không tìm thấy sự kiện
            </h3>
            <p className="text-slate-500">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </section>
    </div>
  );
}
