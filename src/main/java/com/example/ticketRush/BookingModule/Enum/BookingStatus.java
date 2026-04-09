package com.example.ticketRush.BookingModule.Enum;

public enum BookingStatus {
    PENDING,    // Đang giữ chỗ, chờ thanh toán
    PAID,       // Đã thanh toán thành công
    CANCELLED,  // Bị hủy (do quá hạn 10 phút hoặc user tự hủy)
    REFUNDED    // Đã hoàn tiền
}