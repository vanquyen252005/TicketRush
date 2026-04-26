package com.example.ticketRush.PaymentModule.Repository;

import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    @Query("""
            select distinct p
            from PaymentTransaction p
            left join fetch p.booking b
            left join fetch b.event
            left join fetch p.user
            order by p.createdAt desc
            """)
    List<PaymentTransaction> findAllDetailedOrderByCreatedAtDesc();
}
