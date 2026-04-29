package com.example.ticketRush.PaymentModule.Service;

import com.example.ticketRush.PaymentModule.Dto.Response.PaymentTransactionResponse;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface PaymentService {

    PaymentTransactionResponse getTransactionByBookingId(Authentication authentication, UUID bookingId);
}
