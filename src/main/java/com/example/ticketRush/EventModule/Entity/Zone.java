package com.example.ticketRush.EventModule.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false, length = 100)
    private String name; // VD: "VIP A", "Stand B"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "color_hex", length = 7)
    private String colorHex;

    @Column(nullable = false)
    private Integer capacity; // Tổng số lượng ghế trong khu vực này

    // Sử dụng tính năng mới của Hibernate 6 (Spring Boot 3) để map trực tiếp ra kiểu JSONB trong PostgreSQL/MySQL
    // Lưu trữ tọa độ, hình dạng SVG của khu vực để Frontend render
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_metadata")
    private String layoutMetadata;
    // 1 Zone -> N Seats
    @OneToMany(mappedBy = "zone", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Seat> seats = new ArrayList<>();
}
