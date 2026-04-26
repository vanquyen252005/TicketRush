package com.example.ticketRush.EventModule.ServiceImpl;

import com.example.ticketRush.BookingModule.Enum.BookingStatus;
import com.example.ticketRush.BookingModule.Repository.BookingRepository;
import com.example.ticketRush.EventModule.Dto.Request.EventRequest;
import com.example.ticketRush.EventModule.Dto.Request.EventSeatLayoutRequest;
import com.example.ticketRush.EventModule.Dto.Response.EventResponse;
import com.example.ticketRush.EventModule.Entity.Event;
import com.example.ticketRush.EventModule.Entity.Seat;
import com.example.ticketRush.EventModule.Entity.Zone;
import com.example.ticketRush.EventModule.Enum.SeatStatus;
import com.example.ticketRush.EventModule.Exception.EventNotFoundException;
import com.example.ticketRush.EventModule.Exception.SeatLayoutConflictException;
import com.example.ticketRush.EventModule.Mapper.EventMapper;
import com.example.ticketRush.EventModule.Repository.EventRepository;
import com.example.ticketRush.EventModule.Service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(EventMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEventById(Long eventId) {
        return EventMapper.toDetailedResponse(getEventEntity(eventId, true));
    }

    @Override
    public EventResponse createEvent(EventRequest request) {
        validateEventTime(request);

        Event event = Event.builder().build();
        EventMapper.updateEntity(event, request);

        return EventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse updateEvent(Long eventId, EventRequest request) {
        validateEventTime(request);

        Event event = getEventEntity(eventId);
        EventMapper.updateEntity(event, request);

        return EventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse updateSeatLayout(Long eventId, EventSeatLayoutRequest request) {
        Event event = getEventEntity(eventId, true);

        if (bookingRepository.countByEventIdAndStatusIn(eventId, List.of(BookingStatus.PENDING, BookingStatus.PAID)) > 0) {
            throw new SeatLayoutConflictException("Không thể thay đổi sơ đồ ghế khi sự kiện đã có đơn hàng đang giữ hoặc đã thanh toán");
        }

        boolean hasLockedOrSoldSeats = event.getZones().stream()
                .flatMap(zone -> zone.getSeats() == null ? java.util.stream.Stream.empty() : zone.getSeats().stream())
                .anyMatch(seat -> seat.getStatus() != SeatStatus.AVAILABLE);

        if (hasLockedOrSoldSeats) {
            throw new SeatLayoutConflictException("Không thể thay đổi sơ đồ ghế khi còn ghế đang giữ hoặc đã bán");
        }

        event.getZones().clear();

        String layoutMetadata = String.format("{\"rows\":%d,\"cols\":%d}", request.rows(), request.cols());

        request.zones().forEach(zoneRequest -> {
            Zone zone = Zone.builder()
                    .name(zoneRequest.name())
                    .price(zoneRequest.base_price())
                    .colorHex(zoneRequest.color_hex())
                    .capacity(zoneRequest.seats().size())
                    .layoutMetadata(layoutMetadata)
                    .build();
            zone.setEvent(event);

            zoneRequest.seats().forEach(seatRequest -> {
                Seat seat = Seat.builder()
                        .rowLabel(seatRequest.row_label())
                        .seatNumber(seatRequest.seat_number())
                        .status(SeatStatus.AVAILABLE)
                        .zone(zone)
                        .build();
                zone.getSeats().add(seat);
            });

            event.getZones().add(zone);
        });

        return EventMapper.toDetailedResponse(eventRepository.save(event));
    }

    @Override
    public void deleteEvent(Long eventId) {
        Event event = getEventEntity(eventId);
        eventRepository.delete(event);
    }

    private Event getEventEntity(Long eventId) {
        return getEventEntity(eventId, false);
    }

    private Event getEventEntity(Long eventId, boolean detailed) {
        if (detailed) {
            return eventRepository.findDetailedById(eventId)
                    .orElseThrow(() -> new EventNotFoundException(eventId));
        }

        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
    }

    private void validateEventTime(EventRequest request) {
        if (request.endTime() != null && request.endTime().isBefore(request.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }
}
