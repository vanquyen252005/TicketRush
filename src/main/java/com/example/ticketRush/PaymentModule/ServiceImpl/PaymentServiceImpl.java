package com.example.ticketRush.PaymentModule.ServiceImpl;

import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import com.example.ticketRush.BookingModule.Exception.BookingAccessDeniedException;
import com.example.ticketRush.BookingModule.Exception.BookingNotFoundException;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.PaymentModule.Dto.Response.PaymentTransactionResponse;
import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.PaymentModule.Enum.PaymentMethod;
import com.example.ticketRush.PaymentModule.Service.PaymentService;
import com.example.ticketRush.PaymentModule.Service.PaymentTransactionService;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final PaymentTransactionService paymentTransactionService;

    @Override
    public PaymentTransactionResponse getTransactionByBookingId(Authentication authentication, UUID bookingId) {
        Booking booking = loadBookingForCurrentUser(authentication, bookingId);

        if (booking.getStatus() != BookingStatus.PAID) {
            throw new IllegalArgumentException("Đơn hàng chưa được thanh toán");
        }

        PaymentTransaction transaction = paymentTransactionService.recordSuccessfulTransaction(
                booking,
                PaymentMethod.INTERNAL,
                null
        );

        return toResponse(transaction);
    }

    private PaymentTransactionResponse toResponse(PaymentTransaction transaction) {
        return new PaymentTransactionResponse(
                transaction.getId(),
                transaction.getBooking() != null ? transaction.getBooking().getId() : null,
                transaction.getUser() != null ? transaction.getUser().getId() : null,
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

    private Booking loadBookingForCurrentUser(Authentication authentication, UUID bookingId) {
        User currentUser = resolveCurrentUser(authentication);
        Booking booking = bookingRepository.findDetailedById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getUser() == null || !booking.getUser().getId().equals(currentUser.getId())) {
            throw new BookingAccessDeniedException("Bạn không có quyền truy cập đơn hàng này");
        }

        return booking;
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BookingAccessDeniedException("Cần đăng nhập để thực hiện thao tác này");
        }

        String email = null;
        String username = null;
        String fullName = null;
        Role role = Role.ROLE_USER;

        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            email = firstNonBlank(
                    jwtAuthenticationToken.getToken().getClaimAsString("email"),
                    jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"),
                    jwtAuthenticationToken.getToken().getSubject()
            );
            username = firstNonBlank(
                    jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"),
                    email
            );
            fullName = firstNonBlank(
                    jwtAuthenticationToken.getToken().getClaimAsString("name"),
                    jwtAuthenticationToken.getToken().getClaimAsString("preferred_username"),
                    email
            );
            role = authentication.getAuthorities().stream()
                    .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()))
                    ? Role.ROLE_ADMIN
                    : Role.ROLE_USER;
        } else {
            email = firstNonBlank(authentication.getName(), "guest@ticketrush.local");
            username = email;
            fullName = email;
        }

        userService.findOrCreateUserFromKeycloak(
                authentication.getName(),
                username,
                email,
                fullName,
                role
        );

        final String resolvedEmail = email;
        final String resolvedUsername = username;

        return userService.findByIdentifier(resolvedEmail)
                .or(() -> userService.findByIdentifier(resolvedUsername))
                .orElseThrow(() -> new BookingAccessDeniedException("Không tìm thấy người dùng hiện tại"));
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
