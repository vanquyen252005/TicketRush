export const checkBackendConnection = async (): Promise<{ success: boolean; message: string }> => {
  const start = Date.now();
  try {
    // Thử gọi một endpoint có tồn tại trong Swagger của bạn
    // Chúng ta sử dụng /api/auth/register
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Gửi body trống để xem server có phản hồi không
    });
    
    // Nếu server có phản hồi (bất kể status code nào, miễn là không phải lỗi mạng)
    // thì nghĩa là đã kết nối được tới Backend.
    const duration = Date.now() - start;
    return {
      success: true,
      message: `Kết nối thành công tới Backend (Status: ${response.status}, Phản hồi: ${duration}ms)`
    };
  } catch (error: any) {
    console.error("Backend Connection Error:", error);
    return {
      success: false,
      message: `Không thể kết nối tới Backend: ${error.message}. Hãy đảm bảo server đang chạy ở cổng 8082 và CORS đã được cấu hình.`
    };
  }
};
