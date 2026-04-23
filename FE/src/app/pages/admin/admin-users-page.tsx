import { useState } from "react";
import { Users, Search, Mail, Phone, Calendar, MoreVertical, Ban, CheckCircle } from "lucide-react";
import { mockUsersList } from "../../data/utils";

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = mockUsersList.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ORGANIZER': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'CUSTOMER': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <p className="text-slate-600">Quản lý và cập nhật thông tin khách hàng</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          Thêm người dùng mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Người dùng</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Liên hệ</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Vai trò</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Ngày tham gia</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
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
                        {user.phone_number}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                      {user.status === 'ACTIVE' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
