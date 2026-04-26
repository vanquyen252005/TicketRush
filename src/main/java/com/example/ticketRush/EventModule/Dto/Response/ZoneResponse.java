package com.example.ticketRush.EventModule.Dto.Response;

import java.math.BigDecimal;
import java.util.List;

public record ZoneResponse(
        Long id,
        Long event_id,
        String name,
        BigDecimal base_price,
        String color_hex,
        Integer capacity,
        Integer available,
        List<SeatResponse> seats
) {
}
