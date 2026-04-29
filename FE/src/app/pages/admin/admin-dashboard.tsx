import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  TrendingUp,
  Ticket,
  Calendar,
  Target,
  DollarSign,
  Users,
  RefreshCw,
  Loader2,
  X,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminDashboardService } from "../../services/admin-dashboard-service";
import { AdminDashboardTransactionFeed, DashboardStats } from "../../types";

const GENDER_COLORS = ["#06b6d4", "#2563eb", "#f97316", "#94a3b8"];
const AGE_COLORS = ["#0f172a", "#0284c7", "#22c55e", "#f59e0b", "#ef4444", "#94a3b8"];

type DashboardMetric = "REVENUE" | "TICKETS" | "EVENTS" | "FILL_RATE";

const moneyFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: unknown) => `${moneyFormatter.format(toNumber(value))}đ`;

const getMetricMeta = (metric: DashboardMetric) => {
  switch (metric) {
    case "REVENUE":
      return {
        title: "Tổng doanh thu",
        description: "Tổng tiền ghi nhận từ các đơn hàng đã xác nhận.",
      };
    case "TICKETS":
      return {
        title: "Vé đã bán",
        description: "Số lượng vé phát sinh từ booking backend thật.",
      };
    case "EVENTS":
      return {
        title: "Sự kiện đang mở bán",
        description: "Danh sách sự kiện đang bán và tình trạng ghế hiện tại.",
      };
    case "FILL_RATE":
      return {
        title: "Tỷ lệ lấp đầy trung bình",
        description: "Tỷ lệ lấp đầy toàn hệ thống và theo từng sự kiện.",
      };
    default:
      return {
        title: "Chi tiết",
        description: "Xem dữ liệu tổng hợp.",
      };
  }
};

const getTransactionStatusMeta = (status?: string) => {
  switch (status) {
    case "SUCCESS":
      return {
        label: "Thành công",
        className: "text-emerald-700 bg-emerald-50 border-emerald-100",
      };
    case "PENDING":
      return {
        label: "Đang chờ",
        className: "text-amber-700 bg-amber-50 border-amber-100",
      };
    case "FAILED":
      return {
        label: "Thất bại",
        className: "text-rose-700 bg-rose-50 border-rose-100",
      };
    case "REFUNDED":
      return {
        label: "Hoàn tiền",
        className: "text-sky-700 bg-sky-50 border-sky-100",
      };
    default:
      return {
        label: status || "---",
        className: "text-slate-700 bg-slate-50 border-slate-200",
      };
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "---";
  }

  return format(new Date(value), "HH:mm:ss dd/MM/yyyy", { locale: vi });
};

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetric | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [liveTransactions, setLiveTransactions] = useState<AdminDashboardTransactionFeed | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const liveFetchInFlight = useRef(false);

  const fetchStats = async (background = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await adminDashboardService.getDashboardStats();
      setStats(data);
      setLastUpdated(data.generated_at ? new Date(data.generated_at) : new Date());
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải dashboard:", err);
      setError("Không thể tải dữ liệu dashboard từ backend.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchLiveTransactions = async (background = false) => {
    if (liveFetchInFlight.current) {
      return;
    }

    liveFetchInFlight.current = true;

    if (background) {
      setIsLiveRefreshing(true);
    } else {
      setIsLiveLoading(true);
    }

    try {
      const data = await adminDashboardService.getLiveTransactions();
      setLiveTransactions(data);
      setLiveError(null);
    } catch (err) {
      console.error("Lỗi khi tải giao dịch realtime:", err);
      setLiveError("Không thể tải dữ liệu giao dịch realtime từ backend.");
    } finally {
      liveFetchInFlight.current = false;
      setIsLiveLoading(false);
      setIsLiveRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLiveTransactions();

    const clockTimer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const dashboardTimer = window.setInterval(() => {
      fetchStats(true);
    }, 15000);

    const liveTimer = window.setInterval(() => {
      fetchLiveTransactions(true);
    }, 1000);

    return () => {
      window.clearInterval(clockTimer);
      window.clearInterval(dashboardTimer);
      window.clearInterval(liveTimer);
    };
  }, []);

  const revenueSeries = stats?.revenue_data ?? [];
  const ticketSeries = stats?.ticket_data ?? [];
  const ageSeries = stats?.audience_age_data ?? [];
  const genderSeries = stats?.audience_gender_data ?? [];
  const eventPerformance = stats?.event_performance ?? [];
  const liveSummary = liveTransactions?.summary;
  const recentTransactions = liveTransactions?.recent_transactions ?? [];
  const liveGeneratedAt = liveTransactions?.generated_at ? new Date(liveTransactions.generated_at) : null;
  const liveReady = Boolean(liveTransactions);

  const activeEventPerformance = useMemo(
    () => eventPerformance.filter((event) => event.status === "PUBLISHED" || event.status === "SELLING"),
    [eventPerformance]
  );

  const sortedRevenueEvents = useMemo(
    () => [...eventPerformance].sort((a, b) => toNumber(b.revenue) - toNumber(a.revenue)),
    [eventPerformance]
  );

  const sortedTicketEvents = useMemo(
    () => [...eventPerformance].sort((a, b) => toNumber(b.sold) - toNumber(a.sold)),
    [eventPerformance]
  );

  const selectedMetricMeta = selectedMetric ? getMetricMeta(selectedMetric) : null;

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    onClick,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
    onClick?: () => void;
  }) => {
    const interactive = Boolean(onClick);

    return (
      <button
        type="button"
        onClick={onClick}
        className={`bg-white rounded-xl shadow-md p-6 text-left transition-all ${
          interactive ? "hover:shadow-xl hover:-translate-y-0.5 cursor-pointer" : "hover:shadow-lg"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {interactive && <ArrowUpRight className="w-4 h-4 text-slate-400" />}
        </div>
        <h3 className="text-slate-600 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            {subtitle}
          </p>
        )}
      </button>
    );
  };

  const renderSegmentTable = (items: Array<{ label: string; count: number; percentage: number }>) => {
    if (items.length === 0) {
      return <div className="text-sm text-slate-400 italic">Chưa có dữ liệu.</div>;
    }

    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <div>
              <div className="text-sm font-semibold text-slate-700">{item.label}</div>
              <div className="text-[11px] text-slate-400">{item.count.toLocaleString("vi-VN")} người</div>
            </div>
            <div className="text-sm font-bold text-cyan-600">{toNumber(item.percentage).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Đang tải dashboard...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-red-800 mb-2">Lỗi kết nối</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => fetchStats()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Bảng điều khiển realtime</h2>
          <p className="text-slate-500">
            Doanh thu, tỷ lệ lấp đầy và nhân khẩu học được cập nhật trực tiếp từ backend.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Làm mới</span>
        </button>
      </div>

      {lastUpdated && (
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          Cập nhật lúc {format(lastUpdated, "HH:mm:ss dd/MM/yyyy", { locale: vi })}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats?.total_revenue ?? 0)}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={lastUpdated ? `Live sync • ${format(lastUpdated, "HH:mm:ss", { locale: vi })}` : "Cập nhật theo thời gian thực"}
          onClick={() => setSelectedMetric("REVENUE")}
        />
        <StatCard
          title="Vé đã bán"
          value={(stats?.total_tickets_sold ?? 0).toLocaleString("vi-VN")}
          icon={Ticket}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          onClick={() => setSelectedMetric("TICKETS")}
        />
        <StatCard
          title="Sự kiện đang mở bán"
          value={stats?.active_events ?? 0}
          icon={Calendar}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => setSelectedMetric("EVENTS")}
        />
        <StatCard
          title="Tỷ lệ lấp đầy trung bình"
          value={`${(stats?.average_fill_rate ?? 0).toFixed(1)}%`}
          icon={Target}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          onClick={() => setSelectedMetric("FILL_RATE")}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 shadow-2xl">
          <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">
              <Activity className="w-3.5 h-3.5" />
              Giao dịch thời gian thực
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-5xl font-black tracking-tight text-white">{format(currentTime, "HH:mm:ss", { locale: vi })}</div>
                <div className="mt-1 text-sm text-slate-300">{format(currentTime, "EEEE, dd/MM/yyyy", { locale: vi })}</div>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isLiveRefreshing ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isLiveRefreshing ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
                {isLiveRefreshing ? "Đang đồng bộ" : "Cập nhật mỗi 1s"}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <CreditCard className="w-4 h-4 text-cyan-300" />
                  Tổng giao dịch
                </div>
                <div className="mt-3 text-2xl font-bold text-white">
                  {liveReady ? (liveSummary?.total_transactions ?? 0).toLocaleString("vi-VN") : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  Thành công
                </div>
                <div className="mt-3 text-2xl font-bold text-white">
                  {liveReady ? (liveSummary?.successful_transactions ?? 0).toLocaleString("vi-VN") : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <Clock className="w-4 h-4 text-amber-300" />
                  Đang chờ
                </div>
                <div className="mt-3 text-2xl font-bold text-white">
                  {liveReady ? (liveSummary?.pending_transactions ?? 0).toLocaleString("vi-VN") : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <AlertTriangle className="w-4 h-4 text-rose-300" />
                  Thất bại
                </div>
                <div className="mt-3 text-2xl font-bold text-white">
                  {liveReady ? (liveSummary?.failed_transactions ?? 0).toLocaleString("vi-VN") : "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Doanh thu thành công</div>
              <div className="mt-2 text-2xl font-bold text-emerald-300">
                {liveReady ? formatCurrency(liveSummary?.successful_amount ?? 0) : "—"}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Đồng hồ server: {liveGeneratedAt ? formatDateTime(liveTransactions?.generated_at) : "---"}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-cyan-300" />
              Đồng hồ giao diện cập nhật mỗi giây, dữ liệu giao dịch tự làm mới từ backend.
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-md border border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                <Activity className="w-3.5 h-3.5" />
                Live feed
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-800">Giao dịch mới nhất</h3>
              <p className="text-sm text-slate-500">Tự động refresh mỗi 1 giây từ endpoint dashboard live.</p>
            </div>
            <button
              onClick={() => fetchLiveTransactions(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50"
            >
              {isLiveRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Làm mới</span>
            </button>
          </div>

          {liveError && (
            <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              {liveError}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Giao dịch</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Sự kiện</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Khách hàng</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Số tiền</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Thời gian</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLiveLoading && !liveTransactions ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                        <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-cyan-600" />
                        Đang tải giao dịch realtime...
                      </td>
                    </tr>
                  ) : recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                        Chưa có giao dịch mới.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx, index) => {
                      const statusMeta = getTransactionStatusMeta(tx.status);
                      const isLatest = index === 0;

                      return (
                        <tr key={tx.id} className={`transition-colors hover:bg-slate-50/70 ${isLatest ? "bg-cyan-50/50" : ""}`}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-sm font-bold tracking-tighter text-slate-800">
                                  #{tx.id.split("-").pop()}
                                </div>
                                <div className="text-[11px] text-slate-400">Ref: {tx.reference_txn_id || "---"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-slate-700">{tx.event_name || "---"}</div>
                              <div className="text-xs text-slate-500">Booking: {tx.booking_id?.substring(0, 8) || "---"}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-slate-700">{tx.user_full_name || "---"}</div>
                              <div className="text-xs text-slate-500">{tx.user_email || "---"}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-bold text-slate-800">{formatCurrency(tx.amount)}</div>
                            <div className="text-[11px] text-slate-400">{tx.payment_method || "---"}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(tx.created_at)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              Đồng hồ giao diện: <span className="font-mono text-slate-700">{format(currentTime, "HH:mm:ss", { locale: vi })}</span>
            </div>
            <div>Đồng bộ backend: {formatDateTime(liveTransactions?.generated_at ?? null)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Doanh thu 6 tháng gần nhất</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                formatter={(value: any) => `${moneyFormatter.format(toNumber(value))} đ`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Số lượng vé bán ra 6 tháng gần nhất</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ticketSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                formatter={(value: any) => `${moneyFormatter.format(toNumber(value))} vé`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="tickets" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-slate-800">Khán giả theo độ tuổi</h3>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(value: any) => `${toNumber(value).toLocaleString("vi-VN")} người`}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {ageSeries.map((entry, index) => (
                    <Cell key={`age-${entry.label}-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {renderSegmentTable(ageSeries)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-slate-800">Khán giả theo giới tính</h3>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genderSeries}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {genderSeries.map((entry, index) => (
                    <Cell key={`gender-${entry.label}-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => {
                    const row = props.payload;
                    return [`${toNumber(value).toLocaleString("vi-VN")} người`, row?.label || name];
                  }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {renderSegmentTable(genderSeries)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Hiệu suất theo sự kiện</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Tên sự kiện</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Vé đã bán</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Tổng vé</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Tỷ lệ lấp đầy</th>
                <th className="text-right py-3 px-4 text-slate-600 font-semibold">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {eventPerformance.map((event) => {
                const fillRate = event.fill_rate ?? (event.total > 0 ? (toNumber(event.sold) / toNumber(event.total)) * 100 : 0);

                return (
                  <tr key={event.event_id ?? event.name} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-800">
                      <div className="flex flex-col">
                        <span>{event.name}</span>
                        {event.status && (
                          <span className="text-[11px] uppercase tracking-wide text-slate-400">{event.status}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{toNumber(event.sold).toLocaleString("vi-VN")}</td>
                    <td className="py-4 px-4 text-slate-600">{toNumber(event.total).toLocaleString("vi-VN")}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[120px]">
                          <div
                            className={`h-2 rounded-full ${
                              fillRate >= 70 ? "bg-green-500" : fillRate >= 40 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(fillRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">{fillRate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-cyan-600">
                      {toNumber(event.revenue) > 0 ? formatCurrency(event.revenue) : "0đ"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMetric && selectedMetricMeta && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedMetric(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedMetricMeta.title}</h3>
                <p className="text-slate-500">{selectedMetricMeta.description}</p>
              </div>
              <button
                onClick={() => setSelectedMetric(null)}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedMetric === "REVENUE" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Tổng doanh thu</div>
                    <div className="text-2xl font-bold text-cyan-600">{formatCurrency(stats?.total_revenue ?? 0)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Dữ liệu tháng gần nhất</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {revenueSeries.length > 0 ? formatCurrency(revenueSeries[revenueSeries.length - 1]?.revenue ?? 0) : "0đ"}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Cập nhật</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {lastUpdated ? format(lastUpdated, "HH:mm:ss dd/MM/yyyy", { locale: vi }) : "---"}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold">Tháng</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueSeries.map((row) => (
                        <tr key={row.month} className="border-b border-slate-100">
                          <td className="py-3 px-4 text-slate-700">{row.month}</td>
                          <td className="py-3 px-4 text-right font-semibold text-cyan-600">{formatCurrency(row.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedMetric === "TICKETS" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Vé đã bán</div>
                    <div className="text-2xl font-bold text-cyan-600">{(stats?.total_tickets_sold ?? 0).toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Sự kiện có vé bán</div>
                    <div className="text-2xl font-bold text-slate-800">{sortedTicketEvents.filter((event) => event.sold > 0).length}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">6 tháng gần nhất</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {ticketSeries.length > 0 ? `${ticketSeries.length} mốc dữ liệu` : "Chưa có dữ liệu"}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold">Tháng</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Vé</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketSeries.map((row) => (
                        <tr key={row.month} className="border-b border-slate-100">
                          <td className="py-3 px-4 text-slate-700">{row.month}</td>
                          <td className="py-3 px-4 text-right font-semibold text-cyan-600">{row.tickets.toLocaleString("vi-VN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold">Sự kiện</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Vé đã bán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTicketEvents.slice(0, 8).map((event) => (
                        <tr key={event.event_id ?? event.name} className="border-b border-slate-100">
                          <td className="py-3 px-4 text-slate-700">{event.name}</td>
                          <td className="py-3 px-4 text-right font-semibold text-cyan-600">{event.sold.toLocaleString("vi-VN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedMetric === "EVENTS" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Đang mở bán</div>
                    <div className="text-2xl font-bold text-cyan-600">{activeEventPerformance.length}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Có ghế lấp đầy</div>
                    <div className="text-2xl font-bold text-slate-800">{activeEventPerformance.filter((event) => toNumber(event.sold) > 0).length}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Tỷ lệ trung bình</div>
                    <div className="text-2xl font-bold text-slate-800">{(stats?.average_fill_rate ?? 0).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold">Sự kiện</th>
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold">Trạng thái</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Ghế đang bán</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Tỷ lệ lấp đầy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEventPerformance.map((event) => {
                        const fillRate = event.fill_rate ?? (event.total > 0 ? (toNumber(event.sold) / toNumber(event.total)) * 100 : 0);
                        return (
                          <tr key={event.event_id ?? event.name} className="border-b border-slate-100">
                            <td className="py-3 px-4 text-slate-700">{event.name}</td>
                            <td className="py-3 px-4 text-slate-500">{event.status || "---"}</td>
                            <td className="py-3 px-4 text-right font-semibold text-cyan-600">{event.sold.toLocaleString("vi-VN")}</td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-700">{fillRate.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedMetric === "FILL_RATE" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Tỷ lệ trung bình</div>
                    <div className="text-2xl font-bold text-cyan-600">{(stats?.average_fill_rate ?? 0).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Sự kiện có lấp đầy</div>
                    <div className="text-2xl font-bold text-slate-800">{eventPerformance.filter((event) => toNumber(event.sold) > 0).length}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Sự kiện hiệu suất cao</div>
                    <div className="text-2xl font-bold text-slate-800">{sortedRevenueEvents[0]?.name || "---"}</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold">Sự kiện</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Đã bán</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Tổng vé</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-semibold">Lấp đầy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventPerformance.map((event) => {
                        const fillRate = event.fill_rate ?? (event.total > 0 ? (toNumber(event.sold) / toNumber(event.total)) * 100 : 0);
                        return (
                          <tr key={event.event_id ?? event.name} className="border-b border-slate-100">
                            <td className="py-3 px-4 text-slate-700">{event.name}</td>
                            <td className="py-3 px-4 text-right font-semibold text-cyan-600">{event.sold.toLocaleString("vi-VN")}</td>
                            <td className="py-3 px-4 text-right text-slate-600">{event.total.toLocaleString("vi-VN")}</td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-700">{fillRate.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
