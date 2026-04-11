import { apiFetch } from "../api-client";
// import mockUsers from "../data/mock-users.json";

export interface RegisterData {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

/*
// Giả lập lưu trữ người dùng mới trong bộ nhớ khi đăng ký (nếu không có Backend)
const registeredUsers = [...mockUsers];
*/

export const authService = {
  register: async (data: RegisterData): Promise<{ message: string }> => {
    // --- CODE THẬT ---
    return apiFetch<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // --- CODE GIẢ LẬP ĐỂ TEST (Đã comment) ---
    /*
    console.log("Simulating Registration:", data);
    const newUser = {
      id: String(registeredUsers.length + 1),
      fullName: data.fullName,
      email: data.email,
      password: data.password || "123456",
      phoneNumber: data.phoneNumber,
      role: "ROLE_USER",
      token: "mock-jwt-token-new-" + Date.now()
    };
    registeredUsers.push(newUser);

    return new Promise((resolve) => {
      setTimeout(() => resolve({ message: "Đăng ký thành công (Giả lập)" }), 1000);
    });
    */
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    // --- CODE THẬT ---
    return apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // --- CODE GIẢ LẬP ĐỂ TEST (Đã comment) ---
    /*
    console.log("Simulating Login for:", data.email);
    const user = registeredUsers.find(u => u.email === data.email && u.password === data.password);
    
    if (user) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({
          token: user.token || "mock-token",
          email: user.email,
          fullName: user.fullName || "Người dùng giả lập",
          role: user.role || "ROLE_USER"
        }), 800);
      });
    }

    throw new Error("Email hoặc mật khẩu không chính xác (Giả lập)");
    */
  },

  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    // --- CODE THẬT ---
    return apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });

    // --- CODE GIẢ LẬP ĐỂ TEST (Đã comment) ---
    /*
    return new Promise((resolve) => {
        setTimeout(() => resolve({
          token: "mock-google-token",
          email: "google-user@gmail.com",
          fullName: "Google User",
          role: "ROLE_USER"
        }), 1000);
      });
    */
  }
};
