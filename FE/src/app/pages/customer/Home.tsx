import { useState } from "react";
import { useNavigate } from "react-router";
import { CustomerLayout } from "../../components/CustomerLayout";
import { store } from "../../store";
import { Event } from "../../types";
import { Search, MapPin, Calendar, Clock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  const navigate = useNavigate();
  const [events] = useState<Event[]>(store.getEvents());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEventClick = (event: Event) => {
    if (event.status === "open") {
      // Simulate checking server load
      const shouldQueue = Math.random() < 0.3; // 30% chance to go to queue
      if (shouldQueue) {
        navigate(`/queue/${event.id}`);
      } else {
        navigate(`/event/${event.id}`);
      }
    }
  };

  const getCountdown = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Khám Phá Sự Kiện Đỉnh Cao
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Đặt vé nhanh chóng, an toàn và tiện lợi
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện theo tên hoặc địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer group"
              onClick={() => handleEventClick(event)}
            >
              <div className="relative">
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {event.status === "soldout" && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold transform -rotate-12">
                      SOLD OUT
                    </span>
                  </div>
                )}
                {event.status === "open" && (
                  <div className="absolute top-4 right-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold"
                    >
                      <TrendingUp className="w-4 h-4" />
                      HOT
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {event.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Giá vé</div>
                  <div className="text-lg font-bold text-blue-600">
                    {event.price.min.toLocaleString("vi-VN")}đ -{" "}
                    {event.price.max.toLocaleString("vi-VN")}đ
                  </div>
                </div>

                {event.status === "upcoming" && event.openSaleDate && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-800 font-medium mb-1">
                      Mở bán sau:
                    </div>
                    <div className="text-lg font-bold text-yellow-600">
                      {getCountdown(event.openSaleDate)}
                    </div>
                  </div>
                )}

                {event.status === "open" && (
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Đặt vé ngay
                  </button>
                )}

                {event.status === "upcoming" && (
                  <button
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
                    disabled
                  >
                    Chưa mở bán
                  </button>
                )}

                {event.status === "soldout" && (
                  <button
                    className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
                    disabled
                  >
                    Đã hết vé
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
