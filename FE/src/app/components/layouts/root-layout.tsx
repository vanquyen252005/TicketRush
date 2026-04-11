import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Ticket, Home, User, LogIn, LogOut, ChevronDown } from "lucide-react";
import { authService } from "../../services/auth-service";

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi route thay đổi
  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsLoggedIn(authenticated);
    if (authenticated) {
      const user = authService.getStoredUser();
      setUserName(user?.fullName || user?.email || "User");
    }
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUserName("");
    setShowUserMenu(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                TicketRush
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'text-cyan-600 bg-cyan-50' 
                    : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
              <Link
                to="/my-tickets"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/my-tickets') 
                    ? 'text-cyan-600 bg-cyan-50' 
                    : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-50'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Vé của tôi</span>
              </Link>

              {isLoggedIn ? (
                /* ─── Logged in: hiển thị tên user + menu ─── */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{userName}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800 truncate">{userName}</p>
                        <p className="text-xs text-slate-500">
                          {authService.getStoredUser()?.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ─── Not logged in: hiển thị nút Đăng nhập ─── */
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/login') 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                to="/my-tickets"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Ticket className="w-5 h-5" />
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                >
                  <LogIn className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">TicketRush</span>
              </div>
              <p className="text-slate-400 text-sm">
                Nền tảng đặt vé sự kiện hàng đầu Việt Nam
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Về chúng tôi</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-cyan-400">Liên hệ</a></li>
                <li><a href="#" className="hover:text-cyan-400">Tuyển dụng</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-cyan-400">Chính sách</a></li>
                <li><a href="#" className="hover:text-cyan-400">Điều khoản</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Liên kết</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/admin" className="hover:text-cyan-400">Quản trị viên</a></li>
                <li><a href="#" className="hover:text-cyan-400">Đối tác</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 TicketRush. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
