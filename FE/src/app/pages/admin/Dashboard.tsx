import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { store } from "../../store";
import { DollarSign, Ticket, TrendingUp, Users } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    soldTickets: 0,
    fillRate: 0,
  });

  const [trafficData, setTrafficData] = useState<{ time: string; tps: number }[]>([]);

  useEffect(() => {
    // Calculate stats
    const events = store.getEvents();
    const tickets = store.getTickets();

    const totalTickets = events.reduce((sum, e) => sum + e.totalSeats, 0);
    const soldTickets = events.reduce((sum, e) => sum + e.soldSeats, 0);
    const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0);
    const fillRate = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

    setStats({
      totalRevenue,
      totalTickets,
      soldTickets,
      fillRate,
    });

    // Simulate real-time traffic data
    const initialData = Array.from({ length: 10 }, (_, i) => ({
      time: `${i}s`,
      tps: Math.floor(Math.random() * 100) + 50,
    }));
    setTrafficData(initialData);

    const interval = setInterval(() => {
      setTrafficData((prev) => {
        const newData = [...prev.slice(1), {
          time: `${Date.now() % 100}s`,
          tps: Math.floor(Math.random() * 100) + 50,
        }];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Mock demographic data
  const genderData = [
    { name: "Nam", value: 55 },
    { name: "Nữ", value: 43 },
    { name: "Khác", value: 2 },
  ];

  const ageData = [
    { age: "18-24", count: 120 },
    { age: "25-34", count: 89 },
    { age: "35-44", count: 45 },
    { age: "45+", count: 23 },
  ];

  const COLORS = ["#3B82F6", "#EC4899", "#8B5CF6", "#F59E0B"];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Thống kê tổng quan thời gian thực</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalRevenue.toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+8.2%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Vé đã bán</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.soldTickets} / {stats.totalTickets}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+15.3%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tỷ lệ lấp đầy</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.fillRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">Live</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Người dùng online</h3>
          <p className="text-2xl font-bold text-gray-900">
            {trafficData[trafficData.length - 1]?.tps || 0}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Live Traffic Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">
            Live Traffic
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Cập nhật mỗi 2 giây)
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="tps"
                stroke="#3B82F6"
                strokeWidth={2}
                name="TPS (Transactions/sec)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Demographics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Thống kê giới tính</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Demographics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Phân bổ độ tuổi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seat Heatmap */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Heatmap Sơ đồ ghế</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-500 to-red-300 rounded-lg">
              <div className="flex-1">
                <div className="font-bold text-white">VIP Zone</div>
                <div className="text-sm text-white/80">Rất HOT - 95% đã bán</div>
              </div>
              <div className="text-2xl font-bold text-white">🔥</div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500 to-orange-300 rounded-lg">
              <div className="flex-1">
                <div className="font-bold text-white">Zone A</div>
                <div className="text-sm text-white/80">HOT - 70% đã bán</div>
              </div>
              <div className="text-2xl font-bold text-white">🔥</div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-lg">
              <div className="flex-1">
                <div className="font-bold text-white">Zone B</div>
                <div className="text-sm text-white/80">Vừa - 45% đã bán</div>
              </div>
              <div className="text-2xl font-bold text-white">📊</div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-300 rounded-lg">
              <div className="flex-1">
                <div className="font-bold text-white">Zone C</div>
                <div className="text-sm text-white/80">Lạnh - 20% đã bán</div>
              </div>
              <div className="text-2xl font-bold text-white">❄️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3">
          {[
            { time: "2 giây trước", text: "Vé VIP-A5 đã được bán", color: "green" },
            { time: "15 giây trước", text: "Ghế Zone A-B3 đang được giữ", color: "yellow" },
            { time: "30 giây trước", text: "Vé Zone B-C10 đã được bán", color: "green" },
            { time: "1 phút trước", text: "500 người đang online", color: "blue" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.color === "green"
                    ? "bg-green-500"
                    : activity.color === "yellow"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
              />
              <div className="flex-1">
                <span className="text-gray-900">{activity.text}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
