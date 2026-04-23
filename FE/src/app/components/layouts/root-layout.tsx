import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Ticket, Home, User, LogIn, LogOut, ChevronDown, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import { useState, useEffect } from "react";

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, login, isInitialized, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Tự động chuyển hướng Admin vào trang quản trị khi đăng nhập thành công
  useEffect(() => {
    if (isInitialized && isAuthenticated && isAdmin && location.pathname === "/") {
      navigate("/admin");
    }
  }, [isInitialized, isAuthenticated, isAdmin, location.pathname, navigate]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/");
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
              {isAuthenticated ? (
                <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white transition-all"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="font-medium max-w-[100px] truncate">{user?.full_name || 'Người dùng'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 border-b border-slate-50 mb-1 hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Tài khoản</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </Link>

                      
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <User className="w-4 h-4" />
                          </div>
                          <span>Thông tin cá nhân</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => login()}
                  disabled={!isInitialized}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    !isInitialized 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{isInitialized ? 'Đăng nhập' : 'Đang tải...'}</span>
                </button>
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
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md max-w-[70px] truncate">
                    {user?.full_name.split(' ').pop()}
                  </span>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => login()}
                  disabled={!isInitialized}
                  className={`p-2 rounded-lg transition-colors ${
                    !isInitialized ? 'bg-slate-200 text-slate-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Đăng xuất</h3>
              <p className="text-slate-500">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
              </p>
            </div>
            <div className="flex border-t border-slate-100">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-6 py-4 text-slate-600 font-semibold hover:bg-slate-50 transition-colors border-r border-slate-100"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-6 py-4 text-red-600 font-bold hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
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
