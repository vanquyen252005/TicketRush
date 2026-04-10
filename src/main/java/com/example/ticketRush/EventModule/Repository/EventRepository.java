package com.example.ticketRush.EventModule.Repository;

import com.example.ticketRush.EventModule.Entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}
