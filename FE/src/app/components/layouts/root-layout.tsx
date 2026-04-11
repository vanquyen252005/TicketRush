import { Outlet, Link, useLocation } from "react-router";
import { Ticket, Home, User, LogIn } from "lucide-react";

export function RootLayout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
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
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                to="/my-tickets"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Ticket className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
              >
                <LogIn className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

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
