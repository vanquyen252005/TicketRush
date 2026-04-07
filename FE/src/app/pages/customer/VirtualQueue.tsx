import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { CustomerLayout } from "../../components/CustomerLayout";
import { store } from "../../store";
import { Users, Clock, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

export default function VirtualQueue() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = eventId ? store.getEvent(eventId) : null;

  const [position, setPosition] = useState(105);
  const [estimatedTime, setEstimatedTime] = useState(150); // seconds

  useEffect(() => {
    if (!event) {
      navigate("/");
      return;
    }

    // Simulate queue progression
    const interval = setInterval(() => {
      setPosition((prev) => {
        const newPos = prev - Math.floor(Math.random() * 3) - 1;
        if (newPos <= 0) {
          clearInterval(interval);
          setTimeout(() => {
            navigate(`/event/${eventId}`);
          }, 500);
          return 0;
        }
        return newPos;
      });

      setEstimatedTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventId, event, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!event) return null;

  return (
    <CustomerLayout showNav={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Users className="w-24 h-24 text-blue-600" />
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2">
            {event.name}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Đang trong hàng đợi ảo
          </p>

          {/* Queue Position */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-6">
            <div className="text-center text-white">
              <div className="text-sm mb-2">Vị trí của bạn</div>
              <motion.div
                key={position}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold mb-2"
              >
                {position}
              </motion.div>
              <div className="text-sm opacity-90">trong hàng đợi</div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Thời gian dự kiến</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(estimatedTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-bold text-red-800 mb-1">
                  Vui lòng KHÔNG tải lại trang!
                </div>
                <div className="text-sm text-red-700">
                  Việc tải lại (F5) hoặc đóng trang sẽ khiến bạn mất lượt trong hàng đợi.
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((105 - position) / 105) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              {Math.round(((105 - position) / 105) * 100)}% hoàn thành
            </div>
          </div>

          {/* Fun Message */}
          <div className="mt-8 text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-gray-500 italic"
            >
              🎵 Đang chạy tới ghế của bạn...
            </motion.div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
