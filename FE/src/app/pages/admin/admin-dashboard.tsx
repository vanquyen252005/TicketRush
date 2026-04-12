import { TrendingUp, Ticket, Calendar, Target, DollarSign } from "lucide-react";
import { mockDashboardStats } from "../../data/utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function AdminDashboard() {
  const stats = mockDashboardStats;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color,
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-slate-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {subtitle && (
        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <div>
      {/* Stats Grid */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={`${(stats.total_revenue / 1000000).toFixed(0)}M đ`}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle="+12.5% so với tháng trước"
        />
        <StatCard
          title="Vé đã bán"
          value={stats.total_tickets_sold.toLocaleString('vi-VN')}
          icon={Ticket}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          subtitle="+8.3% so với tháng trước"
        />
        <StatCard
          title="Sự kiện đang diễn ra"
          value={stats.active_events}
          icon={Calendar}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Tỷ lệ lấp đầy trung bình"
          value={`${stats.average_fill_rate}%`}
          icon={Target}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Biểu đồ doanh thu (6 tháng gần nhất)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenue_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                formatter={(value: any) => `${(value / 1000000).toFixed(0)}M đ`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Số lượng vé bán ra (6 tháng gần nhất)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ticket_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                formatter={(value: any) => `${value} vé`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="tickets" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Performance Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Hiệu suất theo sự kiện
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">
                  Tên sự kiện
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">
                  Vé đã bán
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">
                  Tổng vé
                </th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">
                  Tỷ lệ lấp đầy
                </th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.event_performance.map((event, index) => {
                const fillRate = (event.sold / event.total) * 100;
                
                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {event.name}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {event.sold.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {event.total.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${
                              fillRate >= 70 ? 'bg-green-500' : 
                              fillRate >= 40 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${fillRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                          {fillRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-cyan-600">
                      {event.revenue > 0 
                        ? `${(event.revenue / 1000000).toFixed(0)}M đ`
                        : '0đ'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
