import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { authService } from "../services/auth-service";
import { toast } from "sonner";

/**
 * Page xử lý callback sau OAuth2/Keycloak redirect login.
 * 
 * Đọc token từ URL query params, lưu vào localStorage,
 * fetch user info, rồi redirect về trang chủ.
 */
export function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      if (!token) {
        setStatus("error");
        setErrorMessage("Không nhận được token xác thực.");
        return;
      }

      try {
        // Lưu tokens
        authService.handleOAuth2Callback(token, refreshToken || "");

        // Fetch user info từ server
        try {
          const me = await authService.getMe();
          localStorage.setItem("user", JSON.stringify(me.user));
        } catch {
          // Nếu không fetch được user info, vẫn ok vì đã có token
          console.warn("Không thể fetch user info, nhưng đã có token");
        }

        setStatus("success");
        toast.success("Đăng nhập thành công!");

        // Redirect về trang chủ sau 1 giây
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);

      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Đã xảy ra lỗi không xác định.");
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Đang xử lý đăng nhập...
              </h2>
              <p className="text-slate-500">
                Vui lòng chờ trong giây lát
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Đăng nhập thành công!
              </h2>
              <p className="text-slate-500">
                Đang chuyển hướng về trang chủ...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Đăng nhập thất bại
              </h2>
              <p className="text-red-500 mb-4">{errorMessage}</p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all font-semibold"
              >
                Quay lại đăng nhập
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
