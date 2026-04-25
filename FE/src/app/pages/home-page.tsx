import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { mockEvents } from "../data/utils";
import { EventCard } from "../components/event-card";
import { checkBackendConnection } from "../check-connection";
import { toast } from "sonner";
import { eventService } from "../services/event-service";
import { Event } from "../types";

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Get suggestion events based on search query, or default latest 20
  const displayFeaturedEvents = searchQuery
    ? events
        .filter(event => 
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.startTime || b.start_time).getTime() - new Date(a.startTime || a.start_time).getTime())
        .slice(0, 20)
    : [...events]
        .sort((a, b) => new Date(b.startTime || b.start_time).getTime() - new Date(a.startTime || a.start_time).getTime())
        .slice(0, 20);

  const categories = ["Tất cả", "Âm nhạc", "Thể thao", "FanMeeting"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const eventCategory = event.category || "Âm nhạc";
    const matchesCategory = selectedCategory === "Tất cả" || eventCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // If we've scrolled to the end (with small buffer)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        setEvents(data);
      } catch (error) {
        console.error("Lỗi khi tải sự kiện:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();

    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      // Check initially
      handleScroll();
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Check backend connection on mount
  useEffect(() => {
    const performCheck = async () => {
      const result = await checkBackendConnection();
      if (result.success) {
        toast.success(result.message, {
          duration: 3000,
        });
      } else {
        toast.error(result.message, {
          duration: 5000,
        });
      }
    };
    performCheck();
  }, []);

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden pb-32 pt-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-cyan-500/30">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-100">Khám phá trải nghiệm mới #2026</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Săn vé sự kiện<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                nhanh nhất
              </span> tại TicketRush
            </h1>
            
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Nền tảng kết nối hàng ngàn sự kiện âm nhạc, thể thao và fan meeting đẳng cấp hàng đầu Việt Nam.
            </p>

            {/* Premium Search Bar */}
            <div className="bg-white/5 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
              <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-white/10 rounded-2xl border border-white/5 group focus-within:border-cyan-500/50 transition-all">
                <Search className="w-6 h-6 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Tìm sự kiện, nghệ sĩ, địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400 text-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Horizontal Scroll Section (Suggestion results) */}
      <section className="container mx-auto px-4 -mt-24 relative z-30 mb-24">
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <h2 className="text-white text-2xl font-bold mb-1 flex items-center gap-2">
              {searchQuery ? "Kết quả gợi ý" : "Sự kiện mới nhất"} 
              {!searchQuery && <span className="text-cyan-400 ring-1 ring-cyan-400/30 px-2 py-0.5 rounded text-xs font-normal">TOP 20</span>}
            </h2>
            <p className="text-slate-400 text-sm">
              {searchQuery ? `Tìm thấy ${displayFeaturedEvents.length} gợi ý phù hợp` : "Đừng bỏ lỡ những khoảnh khắc tuyệt vời nhất"}
            </p>
          </div>
        </div>

        <div className="relative group/scroll">
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 snap-x snap-mandatory px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayFeaturedEvents.map((event) => (
              <div 
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="flex-shrink-0 w-[300px] md:w-[420px] snap-start"
              >
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-white/10 bg-slate-800 hover:scale-[1.02] transition-all duration-500">
                  <img 
                    src={event.imageUrl || event.image} 
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full shadow-lg">
                      {event.category || "Âm nhạc"}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="truncate max-w-[150px]">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {displayFeaturedEvents.length === 0 && (
              <div className="w-full py-12 text-center bg-slate-800/50 backdrop-blur-md rounded-3xl border border-white/10">
                <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Không tìm thấy gợi ý nào cho "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Right Arrow Navigation */}
          {showRightArrow && (
            <button 
              onClick={scrollRight}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-md text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all z-40 border border-white/20 active:scale-90"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      </section>

      {/* Sticky Category Menu */}
      <section className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-md py-4 shadow-sm mb-12 border-b border-slate-200">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 inline-flex flex-wrap gap-2 md:flex hidden">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  selectedCategory === category
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Mobile Categories */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-6 py-2 rounded-full font-bold text-sm border ${
                  selectedCategory === category
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Sự kiện đang diễn ra
          </h2>
          <div className="h-1 flex-1 mx-8 bg-slate-100 rounded-full md:block hidden"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 px-4 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center transform transition-transform hover:rotate-12">
              <Search className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Rất tiếc, chưa tìm thấy sự kiện nào
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Bạn hãy thử đổi thể loại khác hoặc từ khóa tìm kiếm xem sao nhé!
            </p>
            <button 
              onClick={() => {setSearchQuery(""); setSelectedCategory("Tất cả");}}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:scale-105 transition-all"
            >
              Làm mới tìm kiếm
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
