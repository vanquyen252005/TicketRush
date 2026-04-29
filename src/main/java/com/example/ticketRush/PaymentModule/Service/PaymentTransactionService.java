package com.example.ticketRush.PaymentModule.Service;

import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.PaymentModule.Enum.PaymentMethod;

public interface PaymentTransactionService {

    PaymentTransaction recordSuccessfulTransaction(Booking booking, PaymentMethod paymentMethod, String gatewayTransactionId);

    void syncMissingTransactionsForPaidBookings();
}
