import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-2">
            Không tìm thấy trang
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
