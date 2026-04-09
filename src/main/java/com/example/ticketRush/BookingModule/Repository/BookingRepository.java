package com.example.ticketRush.BookingModule.Repository;

import com.example.ticketRush.BookingModule.Entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
}
