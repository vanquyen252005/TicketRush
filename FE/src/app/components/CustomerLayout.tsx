import { Link, useNavigate } from "react-router";
import { Ticket, User, Home, LogIn, ChevronDown } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface CustomerLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function CustomerLayout({ children, showNav = true }: CustomerLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useCustomerAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showNav && (
        <nav className="bg-white shadow-md border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2">
                <Ticket className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TicketRush
                </span>
              </Link>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Trang chủ</span>
                </button>
                {!user ? (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Đăng nhập</span>
                  </Link>
                ) : null}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span>Tôi</span>
                        <ChevronDown className="w-4 h-4 opacity-90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/my-tickets")}>
                        <Ticket className="w-4 h-4" />
                        Vé của tôi
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          logout();
                          navigate("/");
                        }}
                      >
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>
          </div>
        </nav>
      )}
      <main>{children}</main>
    </div>
  );
}
