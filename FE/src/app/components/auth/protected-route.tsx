import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/use-auth";
import { Loader2, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Actual Page Content */}
      <div className={!isAuthenticated ? "pointer-events-none select-none" : ""}>
        {children}
      </div>

      {/* Login Overlay */}
      {!isAuthenticated && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-white/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-200/60 transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-10 h-10 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Yêu cầu đăng nhập
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Bạn chưa đăng nhập, vui lòng đăng nhập để xem thông tin vé của mình.
            </p>
            <button
              onClick={() => navigate("/login", { state: { from: location } })}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-cyan-900/20 font-bold text-lg"
            >
              Đăng nhập ngay
            </button>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
