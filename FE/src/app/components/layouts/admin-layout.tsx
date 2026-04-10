import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Calendar, Settings, LogOut, Ticket } from "lucide-react";

export function AdminLayout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white">
        <div className="p-6">
          <Link to="/admin" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold">TicketRush</div>
              <div className="text-xs text-slate-400">Admin Portal</div>
            </div>
          </Link>

          <nav className="space-y-2">
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin') && location.pathname === '/admin'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/admin/events"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/events')
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Quản lý Sự kiện</span>
            </Link>
            
            <div className="border-t border-slate-800 my-4"></div>
            
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Về Trang chủ</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
