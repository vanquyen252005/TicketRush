package com.example.ticketRush.PaymentModule.ServiceImpl;

import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.PaymentModule.Enum.PaymentMethod;
import com.example.ticketRush.PaymentModule.Enum.PaymentStatus;
import com.example.ticketRush.PaymentModule.Repository.PaymentTransactionRepository;
import com.example.ticketRush.PaymentModule.Service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private static final String INTERNAL_PAYMENT_PREFIX = "INTERNAL";
    private static final String DEFAULT_CURRENCY = "VND";

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Override
    @Transactional
    public PaymentTransaction recordSuccessfulTransaction(Booking booking, PaymentMethod paymentMethod, String gatewayTransactionId) {
        if (booking == null || booking.getId() == null) {
            throw new IllegalArgumentException("Booking is required to record payment transaction");
        }

        Optional<PaymentTransaction> existingTransaction = paymentTransactionRepository.findFirstByBooking_IdOrderByCreatedAtDesc(booking.getId());
        if (existingTransaction.isPresent()) {
            ensureBookingReference(booking, existingTransaction.get().getReferenceTxnId());
            return existingTransaction.get();
        }

        String referenceTxnId = normalizeReferenceTxnId(booking);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .booking(booking)
                .user(booking.getUser())
                .amount(defaultAmount(booking.getTotalAmount()))
                .currency(DEFAULT_CURRENCY)
                .paymentMethod(paymentMethod != null ? paymentMethod : PaymentMethod.INTERNAL)
                .status(PaymentStatus.SUCCESS)
                .referenceTxnId(referenceTxnId)
                .gatewayTransactionId(normalizeGatewayTransactionId(booking, gatewayTransactionId))
                .build();

        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);
        ensureBookingReference(booking, savedTransaction.getReferenceTxnId());
        return savedTransaction;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void syncMissingTransactionsForPaidBookings() {
        long paidBookingCount = bookingRepository.countByStatus(BookingStatus.PAID);
        long successTransactionCount = paymentTransactionRepository.countByStatus(PaymentStatus.SUCCESS);

        if (paidBookingCount == 0 || successTransactionCount >= paidBookingCount) {
            return;
        }

        List<Booking> paidBookings = bookingRepository.findAllPaidDetailed();
        if (paidBookings.isEmpty()) {
            return;
        }

        List<UUID> bookingIds = paidBookings.stream()
                .map(Booking::getId)
                .filter(Objects::nonNull)
                .toList();

        if (bookingIds.isEmpty()) {
            return;
        }

        Set<UUID> existingBookingIds = new HashSet<>(paymentTransactionRepository.findBookingIdsByBookingIdIn(bookingIds));
        List<PaymentTransaction> transactionsToCreate = new ArrayList<>();

        for (Booking booking : paidBookings) {
            if (booking == null || booking.getId() == null || existingBookingIds.contains(booking.getId())) {
                continue;
            }

            String referenceTxnId = normalizeReferenceTxnId(booking);
            ensureBookingReference(booking, referenceTxnId);
            transactionsToCreate.add(PaymentTransaction.builder()
                    .booking(booking)
                    .user(booking.getUser())
                    .amount(defaultAmount(booking.getTotalAmount()))
                    .currency(DEFAULT_CURRENCY)
                    .paymentMethod(PaymentMethod.INTERNAL)
                    .status(PaymentStatus.SUCCESS)
                    .referenceTxnId(referenceTxnId)
                    .gatewayTransactionId(normalizeGatewayTransactionId(booking, null))
                    .build());
        }

        if (!transactionsToCreate.isEmpty()) {
            paymentTransactionRepository.saveAll(transactionsToCreate);
        }
    }

    private void ensureBookingReference(Booking booking, String referenceTxnId) {
        if (booking != null && referenceTxnId != null && !referenceTxnId.equals(booking.getPaymentTransactionId())) {
            booking.setPaymentTransactionId(referenceTxnId);
        }
    }

    private String normalizeReferenceTxnId(Booking booking) {
        if (booking.getPaymentTransactionId() != null && !booking.getPaymentTransactionId().isBlank()) {
            return booking.getPaymentTransactionId();
        }

        return INTERNAL_PAYMENT_PREFIX + "-" + booking.getId();
    }

    private String normalizeGatewayTransactionId(Booking booking, String gatewayTransactionId) {
        if (gatewayTransactionId != null && !gatewayTransactionId.isBlank()) {
            return gatewayTransactionId;
        }

        return INTERNAL_PAYMENT_PREFIX + "-GW-" + booking.getId();
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}
