package com.example.ticketRush.EventModule.Dto.Request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record EventSeatLayoutRequest(
        @Positive(message = "Grid rows must be greater than zero")
        int rows,

        @Positive(message = "Grid cols must be greater than zero")
        int cols,

        @NotEmpty(message = "At least one zone is required")
        List<@Valid ZoneRequest> zones
) {
    public record ZoneRequest(
            Long id,

            @NotBlank(message = "Zone name is required")
            @Size(max = 100, message = "Zone name must be at most 100 characters")
            String name,

            @NotNull(message = "Zone price is required")
            @DecimalMin(value = "0.0", inclusive = true, message = "Zone price must be non-negative")
            BigDecimal base_price,

            @NotBlank(message = "Zone color is required")
            @Size(min = 4, max = 7, message = "Zone color must be a valid hex color")
            String color_hex,

            @NotEmpty(message = "Zone must contain at least one seat")
            List<@Valid SeatRequest> seats
    ) {
    }

    public record SeatRequest(
            @NotBlank(message = "Seat row label is required")
            String row_label,

            @NotBlank(message = "Seat number is required")
            String seat_number
    ) {
    }
}
