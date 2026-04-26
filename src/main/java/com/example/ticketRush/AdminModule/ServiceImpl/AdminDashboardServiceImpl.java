package com.example.ticketRush.AdminModule.ServiceImpl;

import com.example.ticketRush.AdminModule.Dto.Response.AdminDashboardResponse;
import com.example.ticketRush.AdminModule.Service.AdminDashboardService;
import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.EventModule.Entity.Event;
import com.example.ticketRush.EventModule.Entity.Zone;
import com.example.ticketRush.EventModule.Enum.EventStatus;
import com.example.ticketRush.EventModule.Repository.EventRepository;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.Period;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private static final List<String> AGE_BUCKETS = List.of("Dưới 18", "18-24", "25-34", "35-44", "45+", "Không rõ");
    private static final List<String> GENDER_BUCKETS = List.of("Nam", "Nữ", "Khác", "Không rõ");

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    public AdminDashboardResponse getDashboard() {
        List<Event> events = eventRepository.findAllDetailed();
        List<Booking> paidBookings = bookingRepository.findAllPaidDetailed();
        List<User> audienceUsers = loadAudienceUsers(paidBookings);

        BigDecimal totalRevenue = paidBookings.stream()
                .map(Booking::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalTicketsSold = paidBookings.stream()
                .mapToLong(booking -> booking.getItems() == null ? 0L : booking.getItems().size())
                .sum();

        long totalCapacity = events.stream()
                .mapToLong(this::resolveEventCapacity)
                .sum();

        long totalSoldAcrossEvents = events.stream()
                .mapToLong(event -> soldTicketsForEvent(event, paidBookings))
                .sum();

        List<YearMonth> months = IntStream.range(0, 6)
                .mapToObj(offset -> YearMonth.now().minusMonths(5L - offset))
                .toList();

        Map<YearMonth, BigDecimal> revenueByMonth = new LinkedHashMap<>();
        Map<YearMonth, Long> ticketByMonth = new LinkedHashMap<>();
        months.forEach(month -> {
            revenueByMonth.put(month, BigDecimal.ZERO);
            ticketByMonth.put(month, 0L);
        });

        paidBookings.forEach(booking -> {
            if (booking.getCreatedAt() == null) {
                return;
            }

            YearMonth yearMonth = YearMonth.from(booking.getCreatedAt());
            if (revenueByMonth.containsKey(yearMonth)) {
                revenueByMonth.put(yearMonth, revenueByMonth.get(yearMonth).add(defaultAmount(booking.getTotalAmount())));
                long itemCount = booking.getItems() == null ? 0L : booking.getItems().size();
                ticketByMonth.put(yearMonth, ticketByMonth.get(yearMonth) + itemCount);
            }
        });

        Map<Long, BigDecimal> revenueByEvent = new LinkedHashMap<>();
        Map<Long, Long> ticketsByEvent = new LinkedHashMap<>();
        paidBookings.forEach(booking -> {
            if (booking.getEvent() == null) {
                return;
            }

            Long eventId = booking.getEvent().getId();
            revenueByEvent.put(eventId, revenueByEvent.getOrDefault(eventId, BigDecimal.ZERO).add(defaultAmount(booking.getTotalAmount())));
            ticketsByEvent.put(eventId, ticketsByEvent.getOrDefault(eventId, 0L) + (booking.getItems() == null ? 0L : booking.getItems().size()));
        });

        List<AdminDashboardResponse.RevenuePoint> revenueData = months.stream()
                .map(month -> new AdminDashboardResponse.RevenuePoint(formatMonth(month), revenueByMonth.getOrDefault(month, BigDecimal.ZERO)))
                .toList();

        List<AdminDashboardResponse.TicketPoint> ticketData = months.stream()
                .map(month -> new AdminDashboardResponse.TicketPoint(formatMonth(month), ticketByMonth.getOrDefault(month, 0L)))
                .toList();

        List<AdminDashboardResponse.EventPerformance> eventPerformance = events.stream()
                .map(event -> {
                    long sold = ticketsByEvent.getOrDefault(event.getId(), 0L);
                    long total = resolveEventCapacity(event);
                    BigDecimal revenue = revenueByEvent.getOrDefault(event.getId(), BigDecimal.ZERO);
                    BigDecimal fillRate = total > 0
                            ? BigDecimal.valueOf(sold)
                            .multiply(BigDecimal.valueOf(100))
                            .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    return new AdminDashboardResponse.EventPerformance(
                            event.getId(),
                            event.getName(),
                            sold,
                            total,
                            revenue,
                            fillRate,
                            event.getStatus() != null ? event.getStatus().name() : "DRAFT"
                    );
                })
                .sorted(Comparator.comparing(AdminDashboardResponse.EventPerformance::revenue).reversed())
                .toList();

        List<AdminDashboardResponse.AudienceSegment> ageData = buildAgeSegments(audienceUsers);
        List<AdminDashboardResponse.AudienceSegment> genderData = buildGenderSegments(audienceUsers);

        BigDecimal averageFillRate = totalCapacity > 0
                ? BigDecimal.valueOf(totalSoldAcrossEvents)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalCapacity), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long activeEvents = events.stream()
                .filter(event -> event.getStatus() == EventStatus.PUBLISHED)
                .count();

        return new AdminDashboardResponse(
                totalRevenue,
                totalTicketsSold,
                activeEvents,
                averageFillRate,
                revenueData,
                ticketData,
                eventPerformance,
                ageData,
                genderData,
                LocalDateTime.now()
        );
    }

    private List<User> loadAudienceUsers(Collection<Booking> paidBookings) {
        List<User> registeredUsers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.ROLE_USER)
                .toList();

        if (!registeredUsers.isEmpty()) {
            return registeredUsers;
        }

        Map<UUID, User> uniqueAudience = new LinkedHashMap<>();
        paidBookings.stream()
                .map(Booking::getUser)
                .filter(Objects::nonNull)
                .forEach(user -> uniqueAudience.putIfAbsent(user.getId(), user));

        return List.copyOf(uniqueAudience.values());
    }

    private long soldTicketsForEvent(Event event, Collection<Booking> bookings) {
        if (event == null || event.getId() == null) {
            return 0L;
        }

        return bookings.stream()
                .filter(booking -> booking.getEvent() != null && event.getId().equals(booking.getEvent().getId()))
                .mapToLong(booking -> booking.getItems() == null ? 0L : booking.getItems().size())
                .sum();
    }

    private long resolveEventCapacity(Event event) {
        if (event == null || event.getZones() == null) {
            return 0L;
        }

        return event.getZones().stream()
                .mapToLong(this::resolveZoneCapacity)
                .sum();
    }

    private long resolveZoneCapacity(Zone zone) {
        if (zone == null) {
            return 0L;
        }

        if (zone.getCapacity() != null && zone.getCapacity() > 0) {
            return zone.getCapacity();
        }

        return zone.getSeats() == null ? 0L : zone.getSeats().size();
    }

    private List<AdminDashboardResponse.AudienceSegment> buildAgeSegments(Collection<User> users) {
        Map<String, Long> counts = new LinkedHashMap<>();
        AGE_BUCKETS.forEach(bucket -> counts.put(bucket, 0L));

        users.forEach(user -> counts.compute(resolveAgeBucket(user.getDateOfBirth()), (key, value) -> value == null ? 1L : value + 1L));

        long total = Math.max(users.size(), 1);
        return counts.entrySet().stream()
                .map(entry -> new AdminDashboardResponse.AudienceSegment(
                        entry.getKey(),
                        entry.getValue(),
                        percentage(entry.getValue(), total)
                ))
                .toList();
    }

    private List<AdminDashboardResponse.AudienceSegment> buildGenderSegments(Collection<User> users) {
        Map<String, Long> counts = new LinkedHashMap<>();
        GENDER_BUCKETS.forEach(bucket -> counts.put(bucket, 0L));

        users.forEach(user -> counts.compute(resolveGender(user.getGender()), (key, value) -> value == null ? 1L : value + 1L));

        long total = Math.max(users.size(), 1);
        return counts.entrySet().stream()
                .map(entry -> new AdminDashboardResponse.AudienceSegment(
                        entry.getKey(),
                        entry.getValue(),
                        percentage(entry.getValue(), total)
                ))
                .toList();
    }

    private String resolveAgeBucket(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return "Không rõ";
        }

        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        if (age < 18) {
            return "Dưới 18";
        }
        if (age < 25) {
            return "18-24";
        }
        if (age < 35) {
            return "25-34";
        }
        if (age < 45) {
            return "35-44";
        }
        return "45+";
    }

    private String resolveGender(String gender) {
        if (gender == null || gender.isBlank()) {
            return "Không rõ";
        }

        String normalized = gender.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("nam") || normalized.equals("male") || normalized.equals("m")) {
            return "Nam";
        }

        if (normalized.equals("nữ") || normalized.equals("nu") || normalized.equals("female") || normalized.equals("f")) {
            return "Nữ";
        }

        if (normalized.equals("khác") || normalized.equals("khac") || normalized.equals("other")) {
            return "Khác";
        }

        return "Khác";
    }

    private BigDecimal percentage(long value, long total) {
        if (total <= 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(value)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private String formatMonth(YearMonth month) {
        return String.format("T%02d/%d", month.getMonthValue(), month.getYear());
    }
}
