package com.example.ticketRush.PaymentModule.Entity;

import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.PaymentModule.Enum.PaymentMethod;
import com.example.ticketRush.PaymentModule.Enum.PaymentStatus;
import com.example.ticketRush.UserModule.Entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions", indexes = {
        // Tối ưu để tìm kiếm giao dịch theo đơn hàng
        /*Giúp cơ sở dữ liệu tìm kiếm siêu tốc tất cả các lần thử thanh toán của một đơn hàng cụ thể.*/
        @Index(name = "idx_payment_booking_id", columnList = "booking_id"),

        // Tối ưu để xử lý Webhook (IPN) từ cổng thanh toán gọi về. Tối ưu khi Flash Sale xảy ra.
        // UPDATE payment_transactions
        //SET status = 'SUCCESS'
        //WHERE gateway_transaction_id = 'MOMO_888999';
        @Index(name = "idx_payment_gateway_txn", columnList = "gateway_transaction_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // --- LOOSE COUPLING ---
//    // Liên kết lỏng sang BookingModule và UserModule
//    @Column(name = "booking_id", nullable = false)
//    private UUID bookingId;

//    @Column(name = "user_id", nullable = false)
//    private UUID userId;

    // --- THÔNG TIN TIỀN TỆ ---
    // BẮT BUỘC dùng BigDecimal cho tiền tệ, tuyệt đối không dùng Float/Double để tránh sai số dấu phẩy động
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";

    // --- THÔNG TIN CỔNG THANH TOÁN ---
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    // Mã giao dịch nội bộ sinh ra để gửi sang cổng thanh toán (VD: VNPAY txn_ref)
    // Phải là UNIQUE để tránh gửi trùng lặp 1 yêu cầu thanh toán nhiều lần
    @Column(name = "reference_txn_id", nullable = false, unique = true, length = 100)
    private String referenceTxnId;

    // Mã giao dịch thực tế do cổng thanh toán (Momo, VNPay) trả về sau khi user trả tiền xong.
    // Dùng để đối soát (reconciliation) với đối tác sau này.
    @Column(name = "gateway_transaction_id", length = 100)
    private String gatewayTransactionId;

    // Lưu lại thông báo lỗi từ cổng thanh toán nếu thất bại (VD: "Khách hàng hủy giao dịch", "Thẻ hết hạn")
    @Column(name = "error_message", length = 255)
    private String errorMessage;

    // (Tùy chọn) Lưu toàn bộ raw JSON response từ cổng thanh toán để debug nếu có tranh chấp
    @Column(name = "gateway_response_raw", columnDefinition = "TEXT")
    private String gatewayResponseRaw;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    // N Payment Transactions -> 1 Booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;


    // N Payment Transactions -> 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}