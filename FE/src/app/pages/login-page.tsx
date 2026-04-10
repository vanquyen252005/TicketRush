import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, User, Phone, Chrome, Loader2 } from "lucide-react";
import { authService } from "../services/auth-service";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login({ email, password });
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response));
        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        await authService.register({
          fullName,
          email,
          password,
          phoneNumber
        });
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true); // Switch to login mode
      }
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Tính năng đăng nhập Google đang được thiết lập...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </h1>
              <p className="text-slate-600 mt-2">
                {isLogin
                  ? 'Chào mừng bạn quay trở lại!'
                  : 'Tạo tài khoản để bắt đầu'}
              </p>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 mb-6"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-slate-700">
                Tiếp tục với Google
              </span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Hoặc</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="0123456789"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-slate-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="text-cyan-600 hover:text-cyan-700">
                    Quên mật khẩu?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg font-semibold flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              </span>
              {' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-cyan-600 hover:text-cyan-700 font-semibold"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </div>
          </div>

          {/* Admin Link */}
          <div className="mt-6 text-center">
            <Link
              to="/admin"
              className="text-sm text-slate-600 hover:text-cyan-600 underline"
            >
              Đăng nhập với tư cách Quản trị viên
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
