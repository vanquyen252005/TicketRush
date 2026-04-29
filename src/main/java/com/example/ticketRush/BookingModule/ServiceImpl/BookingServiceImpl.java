package com.example.ticketRush.BookingModule.ServiceImpl;

import com.example.ticketRush.BookingModule.Dto.Request.BookingHoldRequest;
import com.example.ticketRush.BookingModule.Dto.Response.BookingResponse;
import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Entity.BookingItem;
import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import com.example.ticketRush.BookingModule.Exception.BookingAccessDeniedException;
import com.example.ticketRush.BookingModule.Exception.BookingExpiredException;
import com.example.ticketRush.BookingModule.Exception.BookingNotFoundException;
import com.example.ticketRush.BookingModule.Exception.SeatUnavailableException;
import com.example.ticketRush.BookingModule.Mapper.BookingMapper;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.BookingModule.Service.BookingService;
import com.example.ticketRush.EventModule.Entity.Event;
import com.example.ticketRush.EventModule.Entity.Seat;
import com.example.ticketRush.EventModule.Enum.EventStatus;
import com.example.ticketRush.EventModule.Enum.SeatStatus;
import com.example.ticketRush.EventModule.Exception.EventNotFoundException;
import com.example.ticketRush.EventModule.Repository.EventRepository;
import com.example.ticketRush.EventModule.Repository.SeatRepository;
import com.example.ticketRush.PaymentModule.Enum.PaymentMethod;
import com.example.ticketRush.PaymentModule.Service.PaymentTransactionService;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final UserService userService;
    private final PaymentTransactionService paymentTransactionService;

    @Override
    public BookingResponse holdSeats(Authentication authentication, BookingHoldRequest request) {
        User currentUser = resolveCurrentUser(authentication);
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new EventNotFoundException(request.eventId()));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new SeatUnavailableException("Sự kiện hiện chưa mở bán");
        }

        List<Long> uniqueSeatIds = request.seatIds().stream()
                .distinct()
                .toList();

        if (uniqueSeatIds.size() != request.seatIds().size()) {
            throw new IllegalArgumentException("Seat list contains duplicate values");
        }

        List<Seat> seats = seatRepository.findSeatsForHold(event.getId(), uniqueSeatIds);
        if (seats.size() != uniqueSeatIds.size()) {
            throw new SeatUnavailableException("Một hoặc nhiều ghế không tồn tại trong sự kiện này");
        }

        Map<Long, Seat> seatById = seats.stream()
                .collect(Collectors.toMap(Seat::getId, seat -> seat));

        for (Long seatId : uniqueSeatIds) {
            Seat seat = seatById.get(seatId);
            if (seat == null) {
                throw new SeatUnavailableException("Ghế không hợp lệ");
            }
            if (!seat.isAvailable()) {
                throw new SeatUnavailableException("Ghế " + seat.getRowLabel() + seat.getSeatNumber() + " hiện không còn khả dụng");
            }
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        Booking booking = Booking.builder()
                .user(currentUser)
                .event(event)
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .expiresAt(expiresAt)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Long seatId : uniqueSeatIds) {
            Seat seat = seatById.get(seatId);
            BigDecimal seatPrice = seat.getZone().getPrice() != null ? seat.getZone().getPrice() : BigDecimal.ZERO;
            seat.setStatus(SeatStatus.LOCKED);
            seat.setLockExpiresAt(expiresAt);
            seat.setUser(currentUser);

            BookingItem item = BookingItem.builder()
                    .seat(seat)
                    .seatLabel(buildSeatLabel(seat))
                    .priceAtPurchase(seatPrice)
                    .build();

            booking.addItem(item);
            totalAmount = totalAmount.add(seatPrice);
        }

        booking.setTotalAmount(totalAmount);
        return BookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse getBookingById(Authentication authentication, UUID bookingId) {
        Booking booking = loadBookingForCurrentUser(authentication, bookingId);
        return BookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse confirmBooking(Authentication authentication, UUID bookingId) {
        Booking booking = loadBookingForCurrentUser(authentication, bookingId);

        if (booking.getStatus() == BookingStatus.PAID) {
            paymentTransactionService.recordSuccessfulTransaction(booking, PaymentMethod.INTERNAL, null);
            return BookingMapper.toResponse(booking);
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingExpiredException("Đơn hàng không còn hợp lệ");
        }

        if (booking.getExpiresAt() != null && booking.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BookingExpiredException("Đã hết thời gian giữ chỗ");
        }

        booking.setStatus(BookingStatus.PAID);
        booking.getItems().forEach(item -> {
            Seat seat = item.getSeat();
            seat.setStatus(SeatStatus.SOLD);
            seat.setLockExpiresAt(null);
            seat.setUser(booking.getUser());
        });

        bookingRepository.save(booking);
        paymentTransactionService.recordSuccessfulTransaction(booking, PaymentMethod.INTERNAL, null);
        return BookingMapper.toResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        User currentUser = resolveCurrentUser(authentication);
        return BookingMapper.toResponses(bookingRepository.findDetailedByUserIdOrderByCreatedAtDesc(currentUser.getId()));
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

    private String buildSeatLabel(Seat seat) {
        String zoneName = seat.getZone() != null ? seat.getZone().getName().replaceAll("\\s+", "-") : "ZONE";
        return zoneName + "-" + seat.getRowLabel() + "-" + seat.getSeatNumber();
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
