import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CreditCard, Search, ArrowUpRight, CheckCircle, Clock, AlertTriangle, Loader2, Wallet, RefreshCw } from "lucide-react";
import { PaymentStatus, AdminPaymentTransaction } from "../../types";
import { adminTransactionService } from "../../services/admin-transaction-service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { isAxiosError } from "axios";

export function AdminTransactionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const userIdFilter = useMemo(() => new URLSearchParams(location.search).get("userId") || undefined, [location.search]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTransactions = async (background = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await adminTransactionService.getTransactions(userIdFilter);
      setTransactions(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải giao dịch:", err);
      setError(
        isAxiosError(err)
          ? (err.response?.data as any)?.error || (err.response?.data as any)?.message || err.message
          : "Không thể tải dữ liệu giao dịch từ backend"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const timer = window.setInterval(() => {
      fetchTransactions(true);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [userIdFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const haystack = [
        tx.id,
        tx.booking_id,
        tx.event_name,
        tx.user_full_name,
        tx.user_email,
        tx.gateway_transaction_id,
        tx.reference_txn_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [transactions, searchTerm]);

  const successfulAmount = transactions
    .filter((tx) => tx.status === "SUCCESS")
    .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

  const pendingCount = transactions.filter((tx) => tx.status === "PENDING").length;
  const failedCount = transactions.filter((tx) => tx.status === "FAILED" || tx.status === "REFUNDED").length;

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 bg-green-50 border-green-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-100";
      case "FAILED":
        return "text-red-600 bg-red-50 border-red-100";
      case "REFUNDED":
        return "text-blue-600 bg-blue-50 border-blue-100";
      default:
        return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Đang tải giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userIdFilter && (
        <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="text-sm text-cyan-800 font-medium">
            Đang lọc giao dịch theo người dùng: <span className="font-bold font-mono">{userIdFilter}</span>
          </div>
          <button
            onClick={() => navigate("/admin/transactions")}
            className="px-4 py-2 rounded-lg bg-white border border-cyan-200 text-cyan-700 text-sm font-bold hover:bg-cyan-50"
          >
            Bỏ lọc
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Giao dịch thanh toán</h2>
          <p className="text-slate-500">Dữ liệu lấy trực tiếp từ `payment_transactions` và tự đồng bộ lại theo chu kỳ.</p>
        </div>
        <button
          onClick={() => fetchTransactions(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Làm mới</span>
        </button>
      </div>

      {lastUpdated && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          Cập nhật lúc {format(lastUpdated, "HH:mm:ss dd/MM/yyyy", { locale: vi })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Giao dịch thành công</p>
          <p className="text-2xl font-bold text-slate-800">{successfulAmount.toLocaleString("vi-VN")}đ</p>
          <div className="mt-2 flex items-center text-green-600 text-xs font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>{transactions.filter((tx) => tx.status === "SUCCESS").length} giao dịch</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Đang chờ xử lý</p>
          <p className="text-2xl font-bold text-slate-800">{pendingCount.toLocaleString("vi-VN")} giao dịch</p>
          <div className="mt-2 flex items-center text-yellow-600 text-xs font-bold">
            <Clock className="w-3 h-3" />
            <span>Chưa xác nhận</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Thất bại/Hoàn tiền</p>
          <p className="text-2xl font-bold text-slate-800">{failedCount.toLocaleString("vi-VN")} giao dịch</p>
          <div className="mt-2 text-slate-400 text-xs">
            <span>Theo dữ liệu backend</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo ID giao dịch, booking, user, event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Giao dịch</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Đơn hàng / Sự kiện</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Khách hàng</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Mã cổng</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Số tiền</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 tracking-tighter">#{tx.id.split("-").pop()}</div>
                        <div className="text-[10px] text-slate-400">Ref: {tx.reference_txn_id || "---"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-700">{tx.event_name || "---"}</div>
                      <div className="text-xs text-slate-500">Booking: {tx.booking_id?.substring(0, 8) || "---"}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-700">{tx.user_full_name || "---"}</div>
                      <div className="text-xs text-slate-500">{tx.user_email || "---"}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">
                    {tx.gateway_transaction_id || "---"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-bold text-slate-800">
                      {tx.amount.toLocaleString("vi-VN")} {tx.currency}
                    </div>
                    <div className="text-[11px] text-slate-400">{tx.payment_method}</div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    {tx.created_at ? format(new Date(tx.created_at), "dd/MM/yyyy HH:mm", { locale: vi }) : "N/A"}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(tx.status)}`}>
                      {tx.status === "SUCCESS" ? <CheckCircle className="w-3 h-3" /> : tx.status === "PENDING" ? <Clock className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    Không tìm thấy giao dịch nào khớp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
