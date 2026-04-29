package com.example.ticketRush.BookingModule.Repository;

import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @Query("""
            select distinct b
            from Booking b
            left join fetch b.event
            left join fetch b.user
            left join fetch b.items i
            left join fetch i.seat s
            left join fetch s.zone
            where b.id = :bookingId
            """)
    Optional<Booking> findDetailedById(@Param("bookingId") UUID bookingId);

    @Query("""
            select distinct b
            from Booking b
            left join fetch b.event
            left join fetch b.user
            left join fetch b.items i
            left join fetch i.seat s
            left join fetch s.zone
            where b.user.id = :userId
            order by b.createdAt desc
            """)
    List<Booking> findDetailedByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("""
            select distinct b
            from Booking b
            left join fetch b.event
            left join fetch b.user
            left join fetch b.items i
            left join fetch i.seat s
            left join fetch s.zone
            order by b.createdAt desc
            """)
    List<Booking> findAllDetailedOrderByCreatedAtDesc();

    @Query("""
            select distinct b
            from Booking b
            left join fetch b.event
            left join fetch b.user
            left join fetch b.items i
            left join fetch i.seat s
            left join fetch s.zone
            where lower(b.user.email) = lower(:email)
            order by b.createdAt desc
            """)
    List<Booking> findDetailedByUserEmailOrderByCreatedAtDesc(@Param("email") String email);

    @Query("""
            select distinct b
            from Booking b
            left join fetch b.event
            left join fetch b.user
            left join fetch b.items i
            left join fetch i.seat s
            left join fetch s.zone
            where b.status = com.example.ticketRush.BookingModule.Enum.BookingStatus.PAID
            order by b.createdAt desc
            """)
    List<Booking> findAllPaidDetailed();

    long countByStatus(BookingStatus status);

    @Query("""
            select count(b)
            from Booking b
            where b.event.id = :eventId
              and b.status in :statuses
            """)
    long countByEventIdAndStatusIn(@Param("eventId") Long eventId, @Param("statuses") Collection<BookingStatus> statuses);
}
