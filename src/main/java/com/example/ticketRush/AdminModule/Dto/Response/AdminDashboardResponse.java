package com.example.ticketRush.AdminModule.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminDashboardResponse(
        BigDecimal total_revenue,
        long total_tickets_sold,
        long active_events,
        BigDecimal average_fill_rate,
        List<RevenuePoint> revenue_data,
        List<TicketPoint> ticket_data,
        List<EventPerformance> event_performance,
        List<AudienceSegment> audience_age_data,
        List<AudienceSegment> audience_gender_data,
        LocalDateTime generated_at
) {
    public record RevenuePoint(
            String month,
            BigDecimal revenue
    ) {
    }

    public record TicketPoint(
            String month,
            long tickets
    ) {
    }

    public record EventPerformance(
            Long event_id,
            String name,
            long sold,
            long total,
            BigDecimal revenue,
            BigDecimal fill_rate,
            String status
    ) {
    }

    public record AudienceSegment(
            String label,
            long count,
            BigDecimal percentage
    ) {
    }
}
