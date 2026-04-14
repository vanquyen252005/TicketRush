import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';

export function UserInfoPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert('Thông tin đã được cập nhật thành công! (Giả lập)');
    console.log('Updated Data:', formData);
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100-16)]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Thông tin cá nhân
        </h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-600 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center">
                <User className="w-12 h-12 text-slate-300" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-16 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <User className="w-4 h-4" /> Họ và tên
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Vai trò
                </label>
                <div className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-500">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </div>
              </div>
            </div>


            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  transition-all duration-300 transform
                  ${isHovered ? 'shadow-lg shadow-cyan-500/40 -translate-y-0.5' : 'shadow-md'}
                `}
              >
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
