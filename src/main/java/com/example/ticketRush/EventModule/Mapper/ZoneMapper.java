package com.example.ticketRush.EventModule.Mapper;

import com.example.ticketRush.EventModule.Dto.Response.ZoneResponse;
import com.example.ticketRush.EventModule.Entity.Zone;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

public final class ZoneMapper {

    private static final List<String> FALLBACK_COLORS = List.of(
            "#0EA5E9",
            "#14B8A6",
            "#F97316",
            "#E11D48",
            "#8B5CF6",
            "#22C55E",
            "#F59E0B",
            "#06B6D4"
    );

    private ZoneMapper() {
    }

    public static ZoneResponse toResponse(Zone zone, Long eventId) {
        int available = (int) (zone.getSeats() == null ? 0 : zone.getSeats().stream().filter(seat -> seat.isAvailable()).count());

        return new ZoneResponse(
                zone.getId(),
                eventId,
                zone.getName(),
                zone.getPrice() != null ? zone.getPrice() : BigDecimal.ZERO,
                resolveColorHex(zone),
                zone.getCapacity(),
                available,
                SeatMapper.toResponses(zone.getSeats())
        );
    }

    public static List<ZoneResponse> toResponses(Collection<Zone> zones, Long eventId) {
        if (zones == null || zones.isEmpty()) {
            return List.of();
        }

        return zones.stream()
                .map(zone -> toResponse(zone, eventId))
                .toList();
    }

    private static String resolveColorHex(Zone zone) {
        if (zone.getColorHex() != null && !zone.getColorHex().isBlank()) {
            return zone.getColorHex();
        }

        int index = Math.floorMod(Objects.hash(zone.getId(), zone.getName()), FALLBACK_COLORS.size());
        return FALLBACK_COLORS.get(index);
    }
}
