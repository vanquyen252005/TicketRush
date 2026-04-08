package com.example.ticketRush.BookingModule.Entity;

import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import com.example.ticketRush.EventModule.Entity.Event;
import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.UserModule.Entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
/* Khi người dùng bấm vào mục "Lịch sử mua hàng", hệ thống phải chạy câu lệnh SELECT * FROM bookings WHERE user_id = '...'.
Nhờ có index này, DB sẽ tìm ra toàn bộ đơn hàng của user đó trong vài mili-giây thay vì phải quét toàn bộ bảng. */
/* Khi chạy flash sale, sau 10 phút nếu khách không trả tiền, ghế phải được nhả ra. Hệ thống sẽ có một tác vụ ngầm (Background Worker) */
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_user", columnList = "user_id"),
        @Index(name = "idx_booking_status_expires", columnList = "status, expires_at") // Rất quan trọng cho Worker quét đơn quá hạn
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Loose coupling: Chỉ lưu ID của User thay vì @ManyToOne
    // Giúp dễ dàng tách thành Microservice sau này nếu cần
//    @Column(name = "user_id", nullable = false)
//    private UUID userId;

//    @Column(name = "event_id", nullable = false)
//    private Long eventId;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status;

    // Mã giao dịch từ cổng thanh toán (VNPay, Momo, Stripe...) để chống double-payment
    @Column(name = "payment_transaction_id", unique = true, length = 100)
    private String paymentTransactionId;

    // Thời điểm đơn hàng hết hạn (VD: created_at + 10 phút)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Quan hệ 1-N với BookingItem
    // CascadeType.ALL để khi lưu Booking thì lưu luôn các Items
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingItem> items = new ArrayList<>();

    // Helper method để add item (Best practice cho quan hệ 2 chiều)
    public void addItem(BookingItem item) {
        items.add(item);
        item.setBooking(this);
    }
    // N Bookings -> 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // N Bookings -> 1 Event
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // 1 Booking -> N Payment Transactions (Có thể thanh toán fail nhiều lần trước khi success)
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PaymentTransaction> paymentTransactions = new ArrayList<>();
}