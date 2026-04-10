import { useState } from "react";
import { Link } from "react-router";
import { Search, MapPin, Calendar, Clock, Sparkles } from "lucide-react";
import { mockEvents } from "../data/mock-data";
import { EventCard } from "../components/event-card";

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const featuredEvents = mockEvents.slice(0, 3);
  const categories = ["all", "Âm nhạc", "Kịch nói", "Thể thao", "Văn hóa"];

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Hero Section with Carousel Banner */}
      <section className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Nền tảng đặt vé #1 Việt Nam</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trải nghiệm sự kiện<br />
              <span className="bg-gradient-to-r from-cyan-200 to-yellow-200 bg-clip-text text-transparent">
                đáng nhớ của bạn
              </span>
            </h1>
            
            <p className="text-xl text-cyan-50 mb-8">
              Đặt vé nhanh chóng, an toàn cho hàng ngàn sự kiện
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện, địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="container mx-auto px-4 -mt-16 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <div key={event.id} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="inline-block px-3 py-1 bg-cyan-500 rounded-full text-xs mb-2">
                  {event.category}
                </div>
                <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-cyan-100">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {category === "all" ? "Tất cả" : category}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">
          Sự kiện đang mở bán
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Không tìm thấy sự kiện
            </h3>
            <p className="text-slate-500">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
