package com.example.ticketRush.BookingModule.Entity;
import com.example.ticketRush.EventModule.Entity.Seat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "booking_items", indexes = {
        @Index(name = "idx_booking_item_seat", columnList = "seat_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Quan hệ N-1 về bảng Booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

//    // Lưu ID của ghế được chọn
//    @Column(name = "seat_id", nullable = false)
//    private Long seatId;

    // BẮT BUỘC: Lưu giá vé tại thời điểm mua.
    // Nếu event thay đổi giá sau này, đơn hàng cũ không bị ảnh hưởng.
    @Column(name = "price_at_purchase", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtPurchase;

    // Tên ghế (VD: VIP-A-12) lưu dạng denormalized để query lịch sử nhanh
    // không cần join bảng Seats nữa.
    @Column(name = "seat_label", nullable = false, length = 50)
    private String seatLabel;
    // 1 BookingItem -> 1 Seat
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false, unique = true) // unique đảm bảo 1 ghế không thể có 2 booking item thành công
    private Seat seat;
}