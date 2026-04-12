import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut, 
  Ticket, 
  ShoppingBag, 
  CreditCard, 
  Users,
  Home,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
  };

  const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active?: boolean }) => (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400'}`} />
        <span className="font-medium">{label}</span>
      </div>
      {active && <ChevronRight className="w-4 h-4 opacity-50" />}
    </Link>
  );

  const NavGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col sticky top-0 h-screen border-r border-slate-800">
        <div className="p-8 pb-4 flex-1 overflow-y-auto scrollbar-hide">
          <Link to="/admin" className="flex items-center gap-3 mb-10 px-2 text-white hover:text-cyan-400 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none mb-1 text-white">TicketRush</div>
              <div className="text-[10px] text-cyan-500 uppercase tracking-tighter font-bold">Admin Portal</div>
            </div>
          </Link>

          <nav>
            <NavGroup title="Tổng quan">
              <NavItem 
                to="/admin" 
                icon={LayoutDashboard} 
                label="Bảng điều khiển" 
                active={location.pathname === '/admin'} 
              />
            </NavGroup>

            <NavGroup title="Nội dung & Sự kiện">
              <NavItem 
                to="/admin/events" 
                icon={Calendar} 
                label="Sự kiện" 
                active={isActive('/admin/events')} 
              />
            </NavGroup>

            <NavGroup title="Kinh doanh">
              <NavItem 
                to="/admin/orders" 
                icon={ShoppingBag} 
                label="Đơn hàng" 
                active={isActive('/admin/orders')} 
              />
              <NavItem 
                to="/admin/transactions" 
                icon={CreditCard} 
                label="Giao dịch" 
                active={isActive('/admin/transactions')} 
              />
            </NavGroup>

            <NavGroup title="Cài đặt hệ thống">
              <NavItem 
                to="/admin/users" 
                icon={Users} 
                label="Người dùng" 
                active={isActive('/admin/users')} 
              />
              <NavItem 
                to="/admin/settings" 
                icon={Settings} 
                label="Cấu hình" 
                active={isActive('/admin/settings')} 
              />
            </NavGroup>

            <div className="my-8 border-t border-slate-800 opacity-50"></div>

            <NavGroup title="Chế độ người dùng">
              <Link
                to="/admin/view-home"
                className={`flex items-center gap-3 px-4 py-3 transition-colors text-sm font-medium ${
                  isActive('/admin/view-home') ? 'text-cyan-400 bg-slate-800 rounded-lg' : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Trang chủ</span>
              </Link>
              <Link
                to="/admin/view-tickets"
                className={`flex items-center gap-3 px-4 py-3 transition-colors text-sm font-medium ${
                  isActive('/admin/view-tickets') ? 'text-cyan-400 bg-slate-800 rounded-lg' : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span>Vé của tôi</span>
              </Link>
            </NavGroup>
          </nav>
        </div>

        {/* User Profile & Logout Section at Bottom */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold shadow-inner">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{user?.full_name || 'Admin User'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">{user?.role === 'ADMIN' ? 'Super Admin' : user?.role || 'Admin'}</div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all font-medium group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-slate-50 overflow-y-auto">
        <div className={location.pathname.includes('/view-') ? 'admin-view' : 'p-8'}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
