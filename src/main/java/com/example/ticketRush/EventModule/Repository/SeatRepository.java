package com.example.ticketRush.EventModule.Repository;

import com.example.ticketRush.EventModule.Entity.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select s
            from Seat s
            join fetch s.zone z
            where z.event.id = :eventId
              and s.id in :seatIds
            """)
    List<Seat> findSeatsForHold(@Param("eventId") Long eventId, @Param("seatIds") Collection<Long> seatIds);
}
