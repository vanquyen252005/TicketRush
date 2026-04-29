package com.example.ticketRush.PaymentModule.Repository;

import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.PaymentModule.Enum.PaymentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    @EntityGraph(attributePaths = {"booking", "booking.event", "user"})
    List<PaymentTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            select distinct p
            from PaymentTransaction p
            left join fetch p.booking b
            left join fetch b.event
            left join fetch p.user
            order by p.createdAt desc
            """)
    List<PaymentTransaction> findAllDetailedOrderByCreatedAtDesc();

    @Query("""
            select distinct p
            from PaymentTransaction p
            left join fetch p.booking b
            left join fetch b.event
            left join fetch p.user
            where p.user.id = :userId
            order by p.createdAt desc
            """)
    List<PaymentTransaction> findDetailedByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("""
            select distinct p.booking.id
            from PaymentTransaction p
            where p.booking.id in :bookingIds
            """)
    List<UUID> findBookingIdsByBookingIdIn(@Param("bookingIds") Collection<UUID> bookingIds);

    Optional<PaymentTransaction> findFirstByBooking_IdOrderByCreatedAtDesc(UUID bookingId);

    long countByStatus(PaymentStatus status);

    long countByStatusIn(List<PaymentStatus> statuses);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from PaymentTransaction p
            where p.status = :status
            """)
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);
}
