import { useState } from "react";
import { Link } from "react-router";
import { User, Mail, Phone, Loader2, KeyRound } from "lucide-react";
import { authService } from "../services/auth-service";
import { toast } from "sonner";

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleKeycloakLogin = () => {
    authService.loginWithKeycloak();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.register({
        fullName,
        email,
        password,
        phoneNumber,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập qua Keycloak.");
      setIsRegister(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isRegister ? "Đăng ký" : "Đăng nhập"}
              </h1>
              <p className="text-slate-600 mt-2">
                {isRegister
                  ? "Tạo hồ sơ trong ứng dụng (nếu API đăng ký đã bật)"
                  : "Đăng nhập an toàn qua Keycloak (OAuth2 / OpenID Connect)"}
              </p>
            </div>

            {!isRegister && (
              <>
                <button
                  type="button"
                  onClick={handleKeycloakLogin}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-3 mb-4 font-semibold shadow-md"
                >
                  <KeyRound className="w-5 h-5" />
                  Đăng nhập với Keycloak
                </button>
                <p className="text-center text-sm text-slate-500 mb-6">
                  Bạn sẽ được chuyển tới trang đăng nhập Keycloak, sau đó quay lại ứng dụng với token.
                </p>
              </>
            )}

            {!isRegister && (
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Hoặc</span>
                </div>
              </div>
            )}

            {isRegister ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
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
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Đăng ký
                </button>
              </form>
            ) : (
              <p className="text-sm text-slate-600 text-center">
                Chưa có tài khoản Keycloak? Tạo user trong realm{" "}
                <code className="text-xs bg-slate-100 px-1 rounded">ticketRush</code> trên máy chủ Keycloak của bạn.
              </p>
            )}

            <div className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-cyan-600 hover:text-cyan-700 font-semibold"
              >
                {isRegister ? "Quay lại đăng nhập" : "Form đăng ký ứng dụng (tuỳ chọn)"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/admin" className="text-sm text-slate-600 hover:text-cyan-600 underline">
              Khu vực quản trị
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
