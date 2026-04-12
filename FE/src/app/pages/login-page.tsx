import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { User, Chrome, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isInitialized, navigate]);

  const handleLogin = () => {
    login();
  };

  const handleRegister = () => {
    register();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
            {/* Logo */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-200">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                TicketRush Auth
              </h1>
              <p className="text-slate-500 mt-3 text-lg">
                Hệ thống xác thực bảo mật qua Keycloak
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-xl font-bold flex items-center justify-center gap-3 text-lg"
              >
                <LogIn className="w-6 h-6" />
                Đăng nhập ngay
              </button>

              <button
                onClick={handleRegister}
                className="w-full py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all font-bold flex items-center justify-center gap-3 text-lg"
              >
                <UserPlus className="w-6 h-6" />
                Đăng ký tài khoản
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-400">Hoặc tiếp tục với</span>
                </div>
              </div>

              <button
                className="w-full py-4 px-6 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-semibold text-slate-600"
              >
                <Chrome className="w-5 h-5 text-red-500" />
                Google (via Keycloak)
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-slate-400">
              Bằng cách đăng nhập, bạn đồng ý với{" "}
              <a href="#" className="underline hover:text-cyan-600">Điều khoản</a>{" "}
              và{" "}
              <a href="#" className="underline hover:text-cyan-600">Chính sách bảo mật</a>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-slate-500 hover:text-cyan-600 transition-colors font-medium"
            >
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
