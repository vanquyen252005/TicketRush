import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Phone, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import { toast } from "sonner";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate with backend using real login API
      const response = await login({ email, password });

      // Check if the user has the ADMIN role
      if (response.role === "ADMIN") {
        toast.success("Đăng nhập Quản trị viên thành công!");
        navigate("/admin");
      } else {
        toast.error("Tài khoản của bạn không có quyền truy cập trang quản trị.");
      }
    } catch (error: any) {
      toast.error(error.message || "Email hoặc mật khẩu không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-cyan-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-cyan-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Quản trị viên</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Nhập mã định danh quản trị để tiếp tục
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">
                Email quản trị
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@ticketrush.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-slate-700"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">
                Mật khẩu hệ thống
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-slate-700"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-lg hover:shadow-cyan-900/10 font-bold flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Xác minh danh tính"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-slate-400 hover:text-cyan-600 transition-colors"
            >
              Quay lại trang đăng nhập người dùng
            </button>
          </div>
        </div>

        {/* Support Note */}
        <p className="mt-8 text-center text-slate-500 text-xs">
          Hệ thống giám sát quyền truy cập.
          Mọi hành động đều được ghi lại.
        </p>
      </div>
    </div>
  );
}
