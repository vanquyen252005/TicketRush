package com.example.ticketRush.EventModule.Repository;

import com.example.ticketRush.EventModule.Entity.Event;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
            select distinct e
            from Event e
            left join fetch e.zones z
            where e.id = :eventId
            """)
    Optional<Event> findDetailedById(@Param("eventId") Long eventId);

    @Query("""
            select distinct e
            from Event e
            left join fetch e.zones z
            """)
    List<Event> findAllDetailed();
}
