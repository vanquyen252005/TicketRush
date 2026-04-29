import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Ban,
  Loader2,
  Eye,
  Ticket,
  CreditCard,
  X,
  ArrowRight,
  Wallet,
  UserCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { isAxiosError } from "axios";
import { adminUserService } from "../../services/admin-user-service";
import { AdminUserDetail, AdminUserSummary } from "../../types";

type RoleFilter = "ALL" | "ROLE_USER" | "ROLE_ADMIN";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "DELETED";
type DetailTab = "INFO" | "BOOKINGS" | "TRANSACTIONS";

const currencyFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

const toCurrency = (value: number) => `${currencyFormatter.format(Number(value ?? 0))}đ`;

const formatDateOnly = (value?: string) => {
  if (!value) {
    return "---";
  }

  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-");
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }

  return value;
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "ROLE_ADMIN":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "ROLE_USER":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "INACTIVE":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "DELETED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Hoạt động";
    case "INACTIVE":
      return "Không hoạt động";
    case "DELETED":
      return "Đã xoá";
    default:
      return status || "---";
  }
};

const getBookingBadge = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "EXPIRED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getTransactionBadge = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "FAILED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "REFUNDED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("INFO");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await adminUserService.getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(
          isAxiosError(err)
            ? (err.response?.data as any)?.error || (err.response?.data as any)?.message || err.message
            : "Không thể tải danh sách người dùng từ backend"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setDetailError(null);
      setDetailTab("INFO");
      return;
    }

    let isActive = true;

    const fetchDetail = async () => {
      setSelectedUser(null);
      setDetailError(null);
      setIsDetailLoading(true);
      try {
        const data = await adminUserService.getUserById(selectedUserId);
        if (!isActive) {
          return;
        }

        setSelectedUser(data);
        setDetailError(null);
      } catch (err) {
        console.error("Failed to fetch user detail:", err);
        if (isActive) {
          setDetailError(
            isAxiosError(err)
              ? (err.response?.data as any)?.error || (err.response?.data as any)?.message || err.message
              : "Không thể tải chi tiết người dùng"
          );
        }
      } finally {
        if (isActive) {
          setIsDetailLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      isActive = false;
    };
  }, [selectedUserId]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const haystack = [
        user.full_name,
        user.email,
        user.phone_number,
        user.gender,
        user.role,
        user.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const adminUsers = users.filter((user) => user.role === "ROLE_ADMIN").length;
  const ticketBuyers = users.filter((user) => user.ticket_count > 0).length;

  const closeDetail = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setDetailError(null);
    setDetailTab("INFO");
  };

  const selectedSummary = selectedUser?.user;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý người dùng</h2>
          <p className="text-slate-500">
            Danh sách người dùng thật, mở chi tiết để xem vé và giao dịch của từng người.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng người dùng</p>
          <p className="text-2xl font-bold text-slate-800">{totalUsers.toLocaleString("vi-VN")}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Đang hoạt động</p>
          <p className="text-2xl font-bold text-emerald-700">{activeUsers.toLocaleString("vi-VN")}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Quản trị viên</p>
          <p className="text-2xl font-bold text-purple-700">{adminUsers.toLocaleString("vi-VN")}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Đã mua vé</p>
          <p className="text-2xl font-bold text-cyan-700">{ticketBuyers.toLocaleString("vi-VN")}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT, vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["ALL", "ROLE_USER", "ROLE_ADMIN"] as RoleFilter[]).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                roleFilter === role
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {role === "ALL" ? "Tất cả vai trò" : role === "ROLE_USER" ? "Người dùng" : "Admin"}
            </button>
          ))}
          {(["ALL", "ACTIVE", "INACTIVE", "DELETED"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                statusFilter === status
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {status === "ALL"
                ? "Tất cả trạng thái"
                : status === "ACTIVE"
                  ? "Hoạt động"
                  : status === "INACTIVE"
                    ? "Không hoạt động"
                    : "Đã xoá"}
            </button>
          ))}
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
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Người dùng</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Liên hệ</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Vai trò</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Vé / Đơn / GD</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Ngày tham gia</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 animate-pulse font-bold">
                    Đang tải dữ liệu người dùng...
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{user.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {user.email}
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {user.phone_number || "---"}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${getStatusBadge(user.status)}`}>
                      {user.status === "ACTIVE" ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {user.ticket_count} vé
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-100">
                        {user.booking_count} đơn
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                        {user.transaction_count} GD
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 font-semibold">
                      {toCurrency(user.total_spent)}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.created_at ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserId(user.id);
                        }}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    Không tìm thấy người dùng nào khớp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUserId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Chi tiết người dùng
                </h3>
                <p className="text-slate-500">
                  Thông tin hồ sơ, vé đã mua và giao dịch của người dùng từ backend thật.
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDetailLoading && !selectedUser ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
              </div>
            ) : detailError && !selectedUser ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm">
                {detailError}
              </div>
            ) : selectedUser ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-2xl font-bold">
                        {selectedSummary?.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-800">{selectedSummary?.full_name}</div>
                        <div className="text-sm text-slate-500">{selectedSummary?.email}</div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Vai trò</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(selectedSummary?.role || "")}`}>
                          {selectedSummary?.role || "---"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Trạng thái</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedSummary?.status || "")}`}>
                          {getStatusLabel(selectedSummary?.status || "")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Giới tính</span>
                        <span className="font-semibold text-slate-700">{selectedSummary?.gender || "---"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Ngày sinh</span>
                        <span className="font-semibold text-slate-700">
                          {formatDateOnly(selectedSummary?.date_of_birth)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">SĐT</span>
                        <span className="font-semibold text-slate-700">{selectedSummary?.phone_number || "---"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Ngày tạo</span>
                        <span className="font-semibold text-slate-700">
                          {selectedSummary?.created_at ? format(new Date(selectedSummary.created_at), "dd/MM/yyyy HH:mm", { locale: vi }) : "---"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Hoạt động cuối</span>
                        <span className="font-semibold text-slate-700">
                          {selectedSummary?.last_activity_at ? format(new Date(selectedSummary.last_activity_at), "dd/MM/yyyy HH:mm", { locale: vi }) : "---"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-1">Tổng đơn</div>
                      <div className="text-2xl font-bold text-cyan-700">{selectedSummary?.booking_count ?? 0}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">Tổng vé</div>
                      <div className="text-2xl font-bold text-emerald-700">{selectedSummary?.ticket_count ?? 0}</div>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1">Giao dịch</div>
                      <div className="text-2xl font-bold text-purple-700">{selectedSummary?.transaction_count ?? 0}</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Tổng chi</div>
                      <div className="text-2xl font-bold text-slate-800">{toCurrency(selectedSummary?.total_spent ?? 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["INFO", "BOOKINGS", "TRANSACTIONS"] as DetailTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                        detailTab === tab
                          ? "bg-slate-800 text-white border-slate-800 shadow-md"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {tab === "INFO" ? "Thông tin" : tab === "BOOKINGS" ? "Vé đã mua" : "Giao dịch"}
                    </button>
                  ))}
                </div>

                {detailTab === "INFO" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Thông tin liên hệ</div>
                        <div className="space-y-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {selectedSummary?.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {selectedSummary?.phone_number || "---"}
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="w-4 h-4 text-slate-400" />
                            {selectedSummary?.role}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Thông tin hồ sơ</div>
                        <div className="space-y-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDateOnly(selectedSummary?.date_of_birth)}
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-slate-400" />
                            {getStatusLabel(selectedSummary?.status || "")}
                          </div>
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-slate-400" />
                            {toCurrency(selectedSummary?.total_spent ?? 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "BOOKINGS" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-800">Vé đã mua</h4>
                      <Link
                        to={`/admin/orders?userId=${selectedSummary?.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                      >
                        Xem toàn bộ
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {selectedUser.bookings.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                        Người dùng này chưa có đơn hàng nào.
                      </div>
                    ) : (
                      selectedUser.bookings.map((booking) => (
                        <div key={booking.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="font-bold text-slate-800">{booking.event_name || "Sự kiện không xác định"}</div>
                              <div className="text-sm text-slate-500">{booking.event_location || "---"}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getBookingBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {(booking.items ?? []).map((item) => (
                              <span key={item.id} className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[11px] font-bold">
                                {item.seat_label}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Tổng tiền</div>
                              <div className="font-bold text-slate-800">{toCurrency(booking.total_amount)}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Ngày đặt</div>
                              <div className="font-bold text-slate-800">
                                {booking.created_at ? format(new Date(booking.created_at), "dd/MM/yyyy HH:mm", { locale: vi }) : "---"}
                              </div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Ghế</div>
                              <div className="font-bold text-slate-800">{booking.items?.length ?? 0}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Mã giao dịch</div>
                              <div className="font-mono text-xs text-slate-700 break-all">{booking.payment_transaction_id || "---"}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {detailTab === "TRANSACTIONS" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-800">Giao dịch thanh toán</h4>
                      <Link
                        to={`/admin/transactions?userId=${selectedSummary?.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                      >
                        Xem toàn bộ
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {selectedUser.transactions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                        Người dùng này chưa có giao dịch nào.
                      </div>
                    ) : (
                      selectedUser.transactions.map((transaction) => (
                        <div key={transaction.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="font-bold text-slate-800">{transaction.event_name || "Sự kiện không xác định"}</div>
                              <div className="text-sm text-slate-500">
                                Booking: {transaction.booking_id?.substring(0, 8) || "---"}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getTransactionBadge(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Số tiền</div>
                              <div className="font-bold text-slate-800">{toCurrency(transaction.amount)}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Phương thức</div>
                              <div className="font-bold text-slate-800">{transaction.payment_method}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Thời gian</div>
                              <div className="font-bold text-slate-800">
                                {transaction.created_at ? format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", { locale: vi }) : "---"}
                              </div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Mã cổng</div>
                              <div className="font-mono text-xs text-slate-700 break-all">
                                {transaction.gateway_transaction_id || transaction.reference_txn_id || "---"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to={`/admin/orders?userId=${selectedSummary?.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    Xem vé của người này
                  </Link>
                  <Link
                    to={`/admin/transactions?userId=${selectedSummary?.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Xem giao dịch của người này
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
