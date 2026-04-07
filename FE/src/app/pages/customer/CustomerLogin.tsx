import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { CustomerLayout } from "../../components/CustomerLayout";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    if (password.length < 1) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }
    login(email.trim(), password);
    toast.success("Đăng nhập thành công!");
    navigate("/", { replace: true });
  };

  return (
    <CustomerLayout>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
            Đăng nhập
          </h1>
          <p className="text-sm text-center text-gray-500 mb-8">
            Nhập email và mật khẩu để tiếp tục (demo — không gọi server).
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ban@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
}
