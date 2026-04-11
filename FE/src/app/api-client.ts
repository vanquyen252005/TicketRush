const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

/**
 * Lấy access token từ localStorage.
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Lấy refresh token từ localStorage.
 */
function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

/**
 * Thử refresh access token bằng refresh token.
 * Trả về true nếu refresh thành công, false nếu thất bại.
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const url = `${API_URL}/api/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch wrapper tự động gắn Bearer token và xử lý refresh khi 401.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Nếu 401 và có refresh token → thử refresh rồi retry 1 lần
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  // Vẫn 401 sau khi refresh → clear tokens, redirect login
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Chỉ redirect nếu không phải đang ở trang login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorBody.error || errorBody.message || `API Error (${response.status})`);
  }

  return response.json();
}

/**
 * URL gốc của API, dùng cho OAuth2 redirect.
 */
export const API_BASE_URL = API_URL;
