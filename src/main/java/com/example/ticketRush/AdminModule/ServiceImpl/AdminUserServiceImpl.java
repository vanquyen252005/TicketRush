package com.example.ticketRush.AdminModule.ServiceImpl;

import com.example.ticketRush.AdminModule.Dto.Response.AdminBookingResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminBookingItemResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminPaymentTransactionResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminUserDetailResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminUserSummaryResponse;
import com.example.ticketRush.AdminModule.Exception.AdminUserNotFoundException;
import com.example.ticketRush.AdminModule.Service.AdminUserService;
import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Entity.BookingItem;
import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.PaymentModule.Repository.PaymentTransactionRepository;
import com.example.ticketRush.PaymentModule.Service.PaymentTransactionService;
import com.example.ticketRush.EventModule.Entity.Seat;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentTransactionService paymentTransactionService;

    @Override
    public List<AdminUserSummaryResponse> getUsers() {
        paymentTransactionService.syncMissingTransactionsForPaidBookings();
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Booking> bookings = bookingRepository.findAllDetailedOrderByCreatedAtDesc();
        List<PaymentTransaction> transactions = paymentTransactionRepository.findAllDetailedOrderByCreatedAtDesc();

        Map<UUID, List<Booking>> bookingsByUser = groupBookingsByUser(bookings);
        Map<UUID, List<PaymentTransaction>> transactionsByUser = groupTransactionsByUser(transactions);

        return users.stream()
                .map(user -> toSummary(user,
                        bookingsByUser.getOrDefault(user.getId(), List.of()),
                        transactionsByUser.getOrDefault(user.getId(), List.of())))
                .toList();
    }

    @Override
    public AdminUserDetailResponse getUser(UUID userId) {
        paymentTransactionService.syncMissingTransactionsForPaidBookings();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AdminUserNotFoundException(userId));

        List<Booking> bookings = bookingRepository.findDetailedByUserIdOrderByCreatedAtDesc(userId);
        List<PaymentTransaction> transactions = paymentTransactionRepository.findDetailedByUserIdOrderByCreatedAtDesc(userId);

        AdminUserSummaryResponse summary = toSummary(user, bookings, transactions);
        List<AdminBookingResponse> bookingResponses = bookings.stream()
                .map(this::toBookingResponse)
                .toList();
        List<AdminPaymentTransactionResponse> transactionResponses = transactions.stream()
                .map(this::toTransactionResponse)
                .toList();

        return new AdminUserDetailResponse(summary, bookingResponses, transactionResponses);
    }

    private AdminUserSummaryResponse toSummary(User user, Collection<Booking> bookings, Collection<PaymentTransaction> transactions) {
        List<Booking> paidBookings = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PAID)
                .toList();

        long bookingCount = bookings.size();
        long ticketCount = paidBookings.stream()
                .mapToLong(booking -> booking.getItems() == null ? 0L : booking.getItems().size())
                .sum();
        long transactionCount = transactions.size();
        BigDecimal totalSpent = paidBookings.stream()
                .map(Booking::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime lastActivityAt = StreamUtils.max(
                user.getUpdatedAt(),
                user.getCreatedAt(),
                bookings.stream().map(Booking::getCreatedAt).filter(java.util.Objects::nonNull).max(LocalDateTime::compareTo).orElse(null),
                transactions.stream().map(PaymentTransaction::getCreatedAt).filter(java.util.Objects::nonNull).max(LocalDateTime::compareTo).orElse(null)
        );

        return new AdminUserSummaryResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getGender(),
                user.getDateOfBirth(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getStatus() != null ? user.getStatus().name() : null,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                bookingCount,
                ticketCount,
                transactionCount,
                totalSpent,
                lastActivityAt
        );
    }

    private Map<UUID, List<Booking>> groupBookingsByUser(List<Booking> bookings) {
        return bookings.stream()
                .filter(booking -> booking.getUser() != null && booking.getUser().getId() != null)
                .collect(Collectors.groupingBy(booking -> booking.getUser().getId()));
    }

    private Map<UUID, List<PaymentTransaction>> groupTransactionsByUser(List<PaymentTransaction> transactions) {
        return transactions.stream()
                .filter(transaction -> transaction.getUser() != null && transaction.getUser().getId() != null)
                .collect(Collectors.groupingBy(transaction -> transaction.getUser().getId()));
    }

    private AdminPaymentTransactionResponse toTransactionResponse(PaymentTransaction transaction) {
        return new AdminPaymentTransactionResponse(
                transaction.getId(),
                transaction.getBooking() != null ? transaction.getBooking().getId() : null,
                transaction.getBooking() != null && transaction.getBooking().getEvent() != null ? transaction.getBooking().getEvent().getId() : null,
                transaction.getBooking() != null && transaction.getBooking().getEvent() != null ? transaction.getBooking().getEvent().getName() : null,
                transaction.getUser() != null ? transaction.getUser().getId() : null,
                transaction.getUser() != null ? transaction.getUser().getFullName() : null,
                transaction.getUser() != null ? transaction.getUser().getEmail() : null,
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().name() : null,
                transaction.getStatus() != null ? transaction.getStatus().name() : null,
                transaction.getGatewayTransactionId(),
                transaction.getReferenceTxnId(),
                transaction.getErrorMessage(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }

    private AdminBookingResponse toBookingResponse(Booking booking) {
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
                        .map(this::toBookingItemResponse)
                        .toList()
        );
    }

    private AdminBookingItemResponse toBookingItemResponse(BookingItem item) {
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

    private String mapStatus(BookingStatus status, LocalDateTime expiresAt) {
        if (status == null) {
            return "PENDING";
        }

        if (status == BookingStatus.PAID) {
            return "CONFIRMED";
        }

        if (status == BookingStatus.PENDING && expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            return "EXPIRED";
        }

        return status.name();
    }

    private static final class StreamUtils {
        private StreamUtils() {
        }

        @SafeVarargs
        private static <T extends Comparable<? super T>> T max(T... values) {
            return java.util.Arrays.stream(values)
                    .filter(java.util.Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(null);
        }
    }
}
