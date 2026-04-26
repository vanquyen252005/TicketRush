import apiClient from "../api-client";
import { User } from "../types";

/**
 * Service xử lý các nghiệp vụ liên quan đến người dùng
 */
export const userService = {
  /**
   * Lấy danh sách tất cả người dùng từ Keycloak (qua Backend API)
   * @returns Promise<User[]>
   */
  async getUsers(): Promise<User[]> {
    try {
      // Gọi API GET /api/admin/users đã tạo ở Backend
      const response = await apiClient.get<User[]>("/api/admin/users");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      throw error;
    }
  },
};
