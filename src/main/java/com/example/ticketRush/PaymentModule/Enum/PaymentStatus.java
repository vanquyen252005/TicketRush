package com.example.ticketRush.PaymentModule.Enum;

public enum PaymentStatus {
    PENDING,    // Đang chờ user quét mã/nhập thẻ trên cổng thanh toán
    SUCCESS,    // Thanh toán thành công
    FAILED,     // Thanh toán thất bại (sai mã OTP, không đủ tiền...)
    REFUNDED    // Đã hoàn tiền (nếu sự kiện bị hủy)
}