package com.example.ticketRush.EventModule.Entity;

import com.example.ticketRush.BookingModule.Entity.BookingItem;
import com.example.ticketRush.EventModule.Enum.SeatStatus;
import com.example.ticketRush.UserModule.Entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "seats", indexes = {
        // Tối ưu cho query lấy danh sách ghế theo khu vực để hiển thị lên màn hình
        @Index(name = "idx_seats_zone_id", columnList = "zone_id"),

        // Tối ưu cho query check trạng thái và tìm ghế cần tự động nhả (release)
        @Index(name = "idx_seats_status_expires", columnList = "status, lock_expires_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(name = "row_label", nullable = false, length = 10)
    private String rowLabel; // VD: "A", "B"

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber; // VD: "1", "2"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatStatus status;

    // --- CÁC TRƯỜNG PHỤC VỤ CONCURRENCY & LOCKING ---
    // Thời điểm hết hạn giữ ghế
    @Column(name = "lock_expires_at")
    private LocalDateTime lockExpiresAt;

    // Transient method hỗ trợ việc kiểm tra tính khả dụng của ghế ngay trên memory
    @Transient
    public boolean isAvailable() {
        return this.status == SeatStatus.AVAILABLE ||
                (this.status == SeatStatus.LOCKED && this.lockExpiresAt != null && this.lockExpiresAt.isBefore(LocalDateTime.now()));
    }
    // N Seats -> 1 User (Người đang giữ ghế)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 1 Seat -> 1 BookingItem (Ghế này đang nằm trong chi tiết đơn hàng nào)
    @OneToOne(mappedBy = "seat", fetch = FetchType.LAZY)
    private BookingItem bookingItem;
}