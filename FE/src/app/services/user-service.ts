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
      const response = await apiClient.get<User[]>("/api/admin/users");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      throw error;
    }
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    gender: string;
    dateOfBirth: string;
  }): Promise<void> {
    await apiClient.post("/api/admin/users", data);
  },

  async updateUser(userId: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    gender: string;
    dateOfBirth: string;
  }): Promise<void> {
    await apiClient.put(`/api/admin/users/${userId}`, data);
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/admin/users/${userId}`);
  },
};
