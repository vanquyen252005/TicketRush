import { apiFetch, API_BASE_URL } from "../api-client";

// ─── Types ───────────────────────────────────────────────────────────────

export interface LoginData {
  identifier: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber: string;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

// ─── Token Management ────────────────────────────────────────────────────

function saveTokens(response: AuthResponse) {
  localStorage.setItem("accessToken", response.accessToken);
  if (response.refreshToken) {
    localStorage.setItem("refreshToken", response.refreshToken);
  }
  localStorage.setItem("user", JSON.stringify(response.user));
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

// ─── Auth Service ────────────────────────────────────────────────────────

export const authService = {
  /**
   * Đăng nhập bằng username/email + password qua Keycloak ROPC.
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    saveTokens(response);
    return response;
  },

  /**
   * Đăng ký tài khoản mới.
   */
  register: async (data: RegisterData): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Đăng nhập bằng Keycloak OAuth2 (redirect-based).
   * Redirect trực tiếp tới backend OAuth2 endpoint.
   */
  loginWithKeycloak: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/ticketRush`;
  },

  /**
   * Xử lý callback sau OAuth2 login: lưu tokens từ URL params.
   */
  handleOAuth2Callback: (token: string, refreshToken: string): void => {
    localStorage.setItem("accessToken", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  },

  /**
   * Refresh access token.
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("Không có refresh token");
    }
    const response = await apiFetch<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    saveTokens(response);
    return response;
  },

  /**
   * Lấy thông tin user hiện tại từ server.
   */
  getMe: async (): Promise<{
    authenticated: boolean;
    name: string;
    authorities: string[];
  }> => {
    return apiFetch("/api/auth/me");
  },

  /**
   * Đăng xuất: xoá tokens khỏi localStorage.
   */
  logout: (): void => {
    clearTokens();
  },

  /**
   * Kiểm tra đã đăng nhập chưa (có token trong localStorage).
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Lấy thông tin user đã lưu trong localStorage.
   */
  getStoredUser: (): UserInfo | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Lấy access token hiện tại.
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },
};
