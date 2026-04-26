package com.example.ticketRush.BookingModule.Mapper;

import com.example.ticketRush.BookingModule.Dto.Response.BookingItemResponse;
import com.example.ticketRush.BookingModule.Dto.Response.BookingResponse;
import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Entity.BookingItem;
import com.example.ticketRush.BookingModule.Enum.BookingStatus;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public final class BookingMapper {

    private BookingMapper() {
    }

    public static BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getEvent() != null ? booking.getEvent().getId() : null,
                booking.getTotalAmount(),
                mapStatus(booking),
                booking.getPaymentTransactionId(),
                booking.getExpiresAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt(),
                toItemResponses(booking.getItems(), booking.getId())
        );
    }

    public static List<BookingResponse> toResponses(Collection<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) {
            return List.of();
        }

        return bookings.stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    private static List<BookingItemResponse> toItemResponses(Collection<BookingItem> items, java.util.UUID bookingId) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        return items.stream()
                .map(item -> new BookingItemResponse(
                        item.getId(),
                        bookingId,
                        item.getSeat() != null ? item.getSeat().getId() : null,
                        item.getSeatLabel(),
                        item.getPriceAtPurchase(),
                        null,
                        null,
                        null
                ))
                .toList();
    }

    private static String mapStatus(Booking booking) {
        BookingStatus status = booking.getStatus();
        if (status == null) {
            return "PENDING";
        }

        if (status == BookingStatus.PAID) {
            return "CONFIRMED";
        }

        if (status == BookingStatus.PENDING && booking.getExpiresAt() != null && booking.getExpiresAt().isBefore(LocalDateTime.now())) {
            return "EXPIRED";
        }

        return status.name();
    }
}
