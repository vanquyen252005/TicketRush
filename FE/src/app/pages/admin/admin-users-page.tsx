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
} from "lucide-react";
import { User } from "../../types";
import { userService } from "../../services/user-service";

type RoleFilter = "ALL" | "ROLE_USER" | "ROLE_ADMIN";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "DELETED";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // 🔄 Load dữ liệu từ API khi trang được mount và tự động cập nhật
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

    // Load lần đầu tiên
    fetchUsers(true);

    // Thiết lập tự động refresh dữ liệu ngầm mỗi 5 giây
    const intervalId = setInterval(() => {
      fetchUsers(false);
    }, 5000);

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  // 🔍 Lọc danh sách theo từ khóa tìm kiếm
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "CUSTOMER":
        return "bg-slate-100 text-slate-700 border-slate-200";
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Quản lý người dùng
          </h2>
          <p className="text-slate-500">Danh sách người dùng hệ thống.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] relative">
        {loading && filteredUsers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">
              Đang tải danh sách người dùng...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">
              Không tìm thấy người dùng nào
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Người dùng
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Liên hệ
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Vai trò
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {user.full_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${getStatusBadge(user.status || "ACTIVE")}`}
                      >
                        {user.status === "ACTIVE" ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
                        {getStatusLabel(user.status || "ACTIVE")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
