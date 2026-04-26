package com.example.ticketRush.AdminModule.ServiceImpl;

import com.example.ticketRush.AdminModule.Dto.Response.AdminPaymentTransactionResponse;
import com.example.ticketRush.AdminModule.Service.AdminTransactionService;
import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.PaymentModule.Repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminTransactionServiceImpl implements AdminTransactionService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public List<AdminPaymentTransactionResponse> getTransactions() {
        return paymentTransactionRepository.findAllDetailedOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AdminPaymentTransactionResponse toResponse(PaymentTransaction transaction) {
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
}
