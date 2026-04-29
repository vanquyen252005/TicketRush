package com.example.ticketRush.AdminModule.ServiceImpl;

import com.example.ticketRush.AdminModule.Dto.Response.AdminBookingItemResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminBookingResponse;
import com.example.ticketRush.AdminModule.Service.AdminBookingService;
import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Entity.BookingItem;
import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import com.example.ticketRush.BookingModule.Exception.BookingNotFoundException;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.EventModule.Entity.Seat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBookingServiceImpl implements AdminBookingService {

    private final BookingRepository bookingRepository;

    @Override
    public List<AdminBookingResponse> getBookings() {
        return bookingRepository.findAllDetailedOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<AdminBookingResponse> getBookings(UUID userId) {
        return bookingRepository.findDetailedByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AdminBookingResponse getBooking(UUID bookingId) {
        Booking booking = bookingRepository.findDetailedById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        return toResponse(booking);
    }

    private AdminBookingResponse toResponse(Booking booking) {
        return new AdminBookingResponse(
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? booking.getUser().getFullName() : null,
                booking.getUser() != null ? booking.getUser().getEmail() : null,
                booking.getUser() != null ? booking.getUser().getPhoneNumber() : null,
                booking.getEvent() != null ? booking.getEvent().getId() : null,
                booking.getEvent() != null ? booking.getEvent().getName() : null,
                booking.getEvent() != null ? booking.getEvent().getLocation() : null,
                booking.getTotalAmount(),
                mapStatus(booking.getStatus(), booking.getExpiresAt()),
                booking.getPaymentTransactionId(),
                booking.getExpiresAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt(),
                booking.getItems() == null ? List.of() : booking.getItems().stream()
                        .map(this::toItemResponse)
                        .toList()
        );
    }

    private AdminBookingItemResponse toItemResponse(BookingItem item) {
        Seat seat = item.getSeat();
        return new AdminBookingItemResponse(
                item.getId(),
                seat != null ? seat.getId() : null,
                item.getSeatLabel(),
                seat != null && seat.getZone() != null ? seat.getZone().getName() : null,
                seat != null ? seat.getRowLabel() : null,
                seat != null ? seat.getSeatNumber() : null,
                item.getPriceAtPurchase()
        );
    }

    private String mapStatus(BookingStatus status, java.time.LocalDateTime expiresAt) {
        if (status == null) {
            return "PENDING";
        }

        if (status == BookingStatus.PAID) {
            return "CONFIRMED";
        }

        if (status == BookingStatus.PENDING && expiresAt != null && expiresAt.isBefore(java.time.LocalDateTime.now())) {
            return "EXPIRED";
        }

        return status.name();
    }
}
