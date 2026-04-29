package com.example.ticketRush.PaymentModule.Controller;

import com.example.ticketRush.PaymentModule.Dto.Response.PaymentTransactionResponse;
import com.example.ticketRush.PaymentModule.Service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/bookings/{bookingId}")
    public PaymentTransactionResponse getTransactionByBookingId(
            @PathVariable UUID bookingId,
            Authentication authentication
    ) {
        return paymentService.getTransactionByBookingId(authentication, bookingId);
    }
}
