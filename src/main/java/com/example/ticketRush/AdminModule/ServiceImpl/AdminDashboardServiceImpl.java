package com.example.ticketRush.AdminModule.ServiceImpl;

import com.example.ticketRush.AdminModule.Dto.Response.AdminDashboardResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminDashboardTransactionsResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminPaymentTransactionResponse;
import com.example.ticketRush.AdminModule.Service.AdminDashboardService;
import com.example.ticketRush.BookingModule.Entity.Booking;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.EventModule.Entity.Event;
import com.example.ticketRush.EventModule.Entity.Zone;
import com.example.ticketRush.EventModule.Enum.EventStatus;
import com.example.ticketRush.EventModule.Repository.EventRepository;
import com.example.ticketRush.PaymentModule.Entity.PaymentTransaction;
import com.example.ticketRush.PaymentModule.Enum.PaymentStatus;
import com.example.ticketRush.PaymentModule.Repository.PaymentTransactionRepository;
import com.example.ticketRush.PaymentModule.Service.PaymentTransactionService;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private static final List<String> AGE_BUCKETS = List.of("Dưới 18", "18-24", "25-34", "35-44", "45+", "Không rõ");
    private static final List<String> GENDER_BUCKETS = List.of("Nam", "Nữ", "Khác", "Không rõ");
    private static final String UNKNOWN_LABEL = "Không rõ";
    private static final Logger log = LoggerFactory.getLogger(AdminDashboardServiceImpl.class);

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentTransactionService paymentTransactionService;
    private final UserService userService;
    private final UserRepository userRepository;

    private record AudienceProfile(String gender, LocalDate dateOfBirth) {
    }

    private record KeycloakProfile(String email, String username, String gender, LocalDate dateOfBirth) {
    }

    @Override
    public AdminDashboardResponse getDashboard() {
        List<Event> events = eventRepository.findAllDetailed();
        List<Booking> paidBookings = bookingRepository.findAllPaidDetailed();
        List<AudienceProfile> audienceProfiles = loadAudienceProfiles(paidBookings);

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

        List<AdminDashboardResponse.AudienceSegment> ageData = buildAgeSegments(audienceProfiles);
        List<AdminDashboardResponse.AudienceSegment> genderData = buildGenderSegments(audienceProfiles);

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

    @Override
    public AdminDashboardTransactionsResponse getLiveTransactions(int limit) {
        paymentTransactionService.syncMissingTransactionsForPaidBookings();

        int safeLimit = Math.min(Math.max(limit, 1), 20);

        List<PaymentTransaction> recentTransactions = paymentTransactionRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit));

        List<AdminPaymentTransactionResponse> recentTransactionResponses = recentTransactions.stream()
                .map(this::toTransactionResponse)
                .toList();

        BigDecimal successfulAmount = defaultAmount(paymentTransactionRepository.sumAmountByStatus(PaymentStatus.SUCCESS));

        AdminDashboardTransactionsResponse.TransactionSummary summary =
                new AdminDashboardTransactionsResponse.TransactionSummary(
                        paymentTransactionRepository.count(),
                        paymentTransactionRepository.countByStatus(PaymentStatus.SUCCESS),
                        paymentTransactionRepository.countByStatus(PaymentStatus.PENDING),
                        paymentTransactionRepository.countByStatusIn(List.of(PaymentStatus.FAILED, PaymentStatus.REFUNDED)),
                        successfulAmount,
                        recentTransactionResponses.isEmpty() ? null : recentTransactionResponses.getFirst().created_at()
                );

        return new AdminDashboardTransactionsResponse(
                summary,
                recentTransactionResponses,
                LocalDateTime.now()
        );
    }

    private List<AudienceProfile> loadAudienceProfiles(Collection<Booking> paidBookings) {
        Map<String, KeycloakProfile> keycloakProfiles = loadKeycloakProfiles();
        Map<UUID, AudienceProfile> uniqueAudience = new LinkedHashMap<>();

        paidBookings.stream()
                .map(Booking::getUser)
                .filter(Objects::nonNull)
                .forEach(user -> {
                    if (user.getId() == null || uniqueAudience.containsKey(user.getId())) {
                        return;
                    }

                    AudienceProfile profile = resolveAudienceProfile(user, keycloakProfiles);
                    uniqueAudience.put(user.getId(), profile);
                });

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

    private List<AdminDashboardResponse.AudienceSegment> buildAgeSegments(Collection<AudienceProfile> profiles) {
        Map<String, Long> counts = new LinkedHashMap<>();
        AGE_BUCKETS.forEach(bucket -> counts.put(bucket, 0L));

        profiles.forEach(profile -> counts.compute(resolveAgeBucket(profile.dateOfBirth()), (key, value) -> value == null ? 1L : value + 1L));

        long total = Math.max(profiles.size(), 1);
        return counts.entrySet().stream()
                .map(entry -> new AdminDashboardResponse.AudienceSegment(
                        entry.getKey(),
                        entry.getValue(),
                        percentage(entry.getValue(), total)
                ))
                .toList();
    }

    private List<AdminDashboardResponse.AudienceSegment> buildGenderSegments(Collection<AudienceProfile> profiles) {
        Map<String, Long> counts = new LinkedHashMap<>();
        GENDER_BUCKETS.forEach(bucket -> counts.put(bucket, 0L));

        profiles.forEach(profile -> counts.compute(resolveGender(profile.gender()), (key, value) -> value == null ? 1L : value + 1L));

        long total = Math.max(profiles.size(), 1);
        return counts.entrySet().stream()
                .map(entry -> new AdminDashboardResponse.AudienceSegment(
                        entry.getKey(),
                        entry.getValue(),
                        percentage(entry.getValue(), total)
                ))
                .toList();
    }

    private String resolveAgeBucket(LocalDate dateOfBirth) {
        if (dateOfBirth == null || dateOfBirth.isAfter(LocalDate.now())) {
            return UNKNOWN_LABEL;
        }

        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        if (age < 0 || age > 120) {
            return UNKNOWN_LABEL;
        }
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
        if (!hasMeaningfulText(gender)) {
            return UNKNOWN_LABEL;
        }

        String normalized = normalizeProfileValue(gender);
        if (normalized.equals("nam") || normalized.equals("male") || normalized.equals("m")) {
            return "Nam";
        }

        if (normalized.equals("nu") || normalized.equals("female") || normalized.equals("f")) {
            return "Nữ";
        }

        if (normalized.equals("khac") || normalized.equals("other")) {
            return "Khác";
        }

        return UNKNOWN_LABEL;
    }

    private Map<String, KeycloakProfile> loadKeycloakProfiles() {
        try {
            Map<String, KeycloakProfile> profiles = new LinkedHashMap<>();

            for (Map<String, Object> user : userService.getAllKeycloakUsers()) {
                KeycloakProfile profile = toKeycloakProfile(user);
                if (profile == null) {
                    continue;
                }

                if (hasMeaningfulText(profile.email())) {
                    profiles.putIfAbsent(normalizeLookupKey(profile.email()), profile);
                }

                if (hasMeaningfulText(profile.username())) {
                    profiles.putIfAbsent(normalizeLookupKey(profile.username()), profile);
                }
            }

            return profiles;
        } catch (Exception e) {
            return Map.of();
        }
    }

    private KeycloakProfile toKeycloakProfile(Map<String, Object> user) {
        if (user == null || user.isEmpty()) {
            return null;
        }

        return new KeycloakProfile(
                asString(user.get("email")),
                asString(user.get("username")),
                normalizeProfileValue(asString(user.get("gender"))),
                parseDateOfBirth(asString(user.get("date_of_birth")))
        );
    }

    private AudienceProfile resolveAudienceProfile(User user, Map<String, KeycloakProfile> keycloakProfiles) {
        KeycloakProfile keycloakProfile = findKeycloakProfile(user, keycloakProfiles);

        String gender = normalizeGenderForStorage(firstMeaningfulText(
                keycloakProfile != null ? keycloakProfile.gender() : null,
                user.getGender()));
        LocalDate dateOfBirth = keycloakProfile != null && keycloakProfile.dateOfBirth() != null
                ? keycloakProfile.dateOfBirth()
                : user.getDateOfBirth();

        syncLocalAudienceProfile(user, gender, dateOfBirth);

        return new AudienceProfile(gender, dateOfBirth);
    }

    private KeycloakProfile findKeycloakProfile(User user, Map<String, KeycloakProfile> keycloakProfiles) {
        if (user == null || keycloakProfiles.isEmpty()) {
            return null;
        }

        KeycloakProfile byEmail = lookupProfile(keycloakProfiles, user.getEmail());
        if (byEmail != null) {
            return byEmail;
        }

        return lookupProfile(keycloakProfiles, user.getUsername());
    }

    private KeycloakProfile lookupProfile(Map<String, KeycloakProfile> profiles, String key) {
        if (!hasMeaningfulText(key)) {
            return null;
        }

        return profiles.get(normalizeLookupKey(key));
    }

    private LocalDate parseDateOfBirth(String value) {
        if (!hasMeaningfulText(value)) {
            return null;
        }

        String trimmed = value.trim();
        List<DateTimeFormatter> formatters = List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("M/d/uuuu"),
                DateTimeFormatter.ofPattern("d/M/uuuu"),
                DateTimeFormatter.ofPattern("uuuu/M/d")
        );

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(trimmed, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        return null;
    }

    private String firstMeaningfulText(String... values) {
        for (String value : values) {
            if (hasMeaningfulText(value)) {
                return value.trim();
            }
        }

        return null;
    }

    private boolean hasMeaningfulText(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = normalizeProfileValue(value);
        return !normalized.equals("n/a")
                && !normalized.equals("na")
                && !normalized.equals("null")
                && !normalized.equals("unknown")
                && !normalized.equals("none")
                && !normalized.equals("-")
                && !normalized.equals("chua cap nhat");
    }

    private String normalizeLookupKey(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeProfileValue(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "").trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeGenderForStorage(String gender) {
        if (!hasMeaningfulText(gender)) {
            return null;
        }

        String normalized = normalizeProfileValue(gender);
        return switch (normalized) {
            case "nam", "male", "m" -> "MALE";
            case "nu", "female", "f" -> "FEMALE";
            case "khac", "other" -> "OTHER";
            default -> gender.trim();
        };
    }

    private void syncLocalAudienceProfile(User user, String gender, LocalDate dateOfBirth) {
        if (user == null || user.getId() == null) {
            return;
        }

        boolean changed = false;
        if (gender != null && !gender.equals(user.getGender())) {
            user.setGender(gender);
            changed = true;
        }
        if (dateOfBirth != null && !dateOfBirth.equals(user.getDateOfBirth())) {
            user.setDateOfBirth(dateOfBirth);
            changed = true;
        }

        if (changed) {
            try {
                userRepository.save(user);
            } catch (Exception e) {
                log.warn("Không thể đồng bộ gender/dateOfBirth cho user {}: {}", user.getId(), e.getMessage());
            }
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
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

    private String formatMonth(YearMonth month) {
        return String.format("T%02d/%d", month.getMonthValue(), month.getYear());
    }
}
