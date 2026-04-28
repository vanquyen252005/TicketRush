import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Ban,
  CheckCircle,
  Loader2,
  Eye,
  X,
  Ticket
} from "lucide-react";
import { User, AdminBooking } from "../../types";
import { userService } from "../../services/user-service";
import { adminBookingService } from "../../services/admin-booking-service";

type RoleFilter = "ALL" | "CUSTOMER" | "ADMIN";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "DELETED";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<AdminBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch bookings when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setUserBookings([]);
      return;
    }
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const bookings = await adminBookingService.getBookingsByEmail(selectedUser.email);
        setUserBookings(bookings);
      } catch (error) {
        console.error("Failed to fetch user bookings", error);
        setUserBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    fetchUsers(true);
    const intervalId = setInterval(() => {
      fetchUsers(false);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesRole = true;
    if (roleFilter === "ADMIN") {
      matchesRole = user.role === "ADMIN" || user.role === "ROLE_ADMIN";
    } else if (roleFilter === "CUSTOMER") {
      matchesRole = user.role !== "ADMIN" && user.role !== "ROLE_ADMIN";
    }

    let matchesStatus = true;
    if (statusFilter !== "ALL") {
      matchesStatus = user.status === statusFilter;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN" || role === "ROLE_ADMIN") {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }
    return "bg-cyan-100 text-cyan-700 border-cyan-200";
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
      case "ACTIVE": return "Hoạt động";
      case "INACTIVE": return "Không hoạt động";
      case "DELETED": return "Đã xoá";
      default: return status || "---";
    }
  };

  // Tính toán số liệu cho Header Cards
  const totalUsers = users.length;
  const customerUsers = users.filter(u => u.role !== 'ADMIN' && u.role !== 'ROLE_ADMIN').length;
  const adminUsers = users.filter(u => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN').length;

  return (
    <div className="space-y-6 p-6 font-sans">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-800">
          Quản lý người dùng
        </h2>
        <p className="text-sm text-slate-500 font-medium">Danh sách người dùng thật, mở chi tiết để xem vé và giao dịch của từng người.</p>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tổng người dùng</p>
          <h3 className="text-2xl font-bold text-slate-800">{totalUsers}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Khách hàng</p>
          <h3 className="text-2xl font-bold text-cyan-600">{customerUsers}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quản trị viên</p>
          <h3 className="text-2xl font-bold text-purple-600">{adminUsers}</h3>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 flex flex-wrap lg:flex-nowrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT, vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="relative group">
          <button className="flex items-center justify-between gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-full text-sm font-bold text-slate-700 transition-colors group-hover:bg-slate-50 min-w-[160px]">
            <span>Vai trò: {roleFilter === 'ALL' ? 'Tất cả' : (roleFilter === 'ADMIN' ? 'Admin' : 'Người dùng')}</span>
          </button>
          <div className="absolute left-0 mt-2 w-full min-w-[160px] bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 overflow-hidden transform translate-y-1 group-hover:translate-y-0">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${roleFilter === 'ALL' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Tất cả vai trò
            </button>
            <button
              onClick={() => setRoleFilter("CUSTOMER")}
              className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${roleFilter === 'CUSTOMER' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Người dùng
            </button>
            <button
              onClick={() => setRoleFilter("ADMIN")}
              className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${roleFilter === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative group">
          <button className="flex items-center justify-between gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-full text-sm font-bold text-slate-700 transition-colors group-hover:bg-slate-50 min-w-[180px]">
            <span>Trạng thái: {statusFilter === 'ALL' ? 'Tất cả' : (statusFilter === 'ACTIVE' ? 'Hoạt động' : (statusFilter === 'INACTIVE' ? 'Không hoạt động' : 'Đã xoá'))}</span>
          </button>
          <div className="absolute left-0 mt-2 w-full min-w-[180px] bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 overflow-hidden transform translate-y-1 group-hover:translate-y-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${statusFilter === 'ALL' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Tất cả trạng thái
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${statusFilter === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${statusFilter === 'INACTIVE' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Không hoạt động
            </button>
            <button
              onClick={() => setStatusFilter("DELETED")}
              className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${statusFilter === 'DELETED' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Đã xoá
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] relative">
        {loading && filteredUsers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Đang tải danh sách người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-5 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Người dùng</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Liên hệ</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Vai trò</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Trạng thái</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Ngày tham gia</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden flex-shrink-0">
                          {user.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">
                            {user.full_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-slate-600 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {user.email}
                        </div>
                        <div className="text-xs font-medium text-slate-600 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {user.phone_number || "---"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getRoleBadge(user.role)}`}>
                        {user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(user.status || "ACTIVE")}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {getStatusLabel(user.status || "ACTIVE")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        26/04/2026
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        className="p-2 text-slate-400 group-hover/row:text-cyan-600 group-hover/row:bg-cyan-50 rounded-full transition-colors focus:outline-none"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {selectedUser.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedUser.full_name}</h3>
                  <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role === 'ADMIN' || selectedUser.role === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">

              {/* Profile Section */}
              <section>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-600" /> Hồ sơ cá nhân
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedUser.phone_number || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Trạng thái</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${selectedUser.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {selectedUser.status === 'ACTIVE' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      {getStatusLabel(selectedUser.status || 'ACTIVE')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Ngày tham gia</p>
                    <p className="text-sm font-semibold text-slate-800">26/04/2026</p>
                  </div>
                </div>
              </section>

              {/* Tickets Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-purple-600" /> Vé đã mua
                  </h4>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    {userBookings.reduce((sum, b) => sum + (b.items?.length || 0), 0)} vé
                  </span>
                </div>

                {loadingBookings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                  </div>
                ) : userBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Ticket className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Chưa có vé</p>
                    <p className="text-xs text-slate-400 mt-1">Người dùng này chưa mua vé nào.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-cyan-200 transition-colors bg-white">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold text-slate-800 truncate">{booking.event_name || `Sự kiện #${booking.event_id}`}</h5>
                          <p className="text-xs font-medium text-slate-500">
                            {booking.event_location || '---'} • {booking.items?.length || 0} ghế
                            {booking.items && booking.items.length > 0 && (
                              <span className="ml-1 text-slate-400">({booking.items.map(i => i.seat_label).join(', ')})</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-800">{booking.total_amount.toLocaleString()}đ</p>
                          <p className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${booking.status === 'CONFIRMED' ? 'text-emerald-600 bg-emerald-50' :
                              booking.status === 'PENDING' ? 'text-amber-600 bg-amber-50' :
                                booking.status === 'CANCELLED' ? 'text-rose-600 bg-rose-50' :
                                  'text-slate-600 bg-slate-50'
                            }`}>
                            {booking.status === 'CONFIRMED' ? 'Đã thanh toán' :
                              booking.status === 'PENDING' ? 'Chờ thanh toán' :
                                booking.status === 'CANCELLED' ? 'Đã hủy' :
                                  booking.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
