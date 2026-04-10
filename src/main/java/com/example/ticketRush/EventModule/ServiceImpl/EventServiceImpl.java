package com.example.ticketRush.EventModule.ServiceImpl;

import com.example.ticketRush.EventModule.Dto.Request.EventRequest;
import com.example.ticketRush.EventModule.Dto.Response.EventResponse;
import com.example.ticketRush.EventModule.Entity.Event;
import com.example.ticketRush.EventModule.Exception.EventNotFoundException;
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
        return EventMapper.toResponse(getEventEntity(eventId));
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
    public void deleteEvent(Long eventId) {
        Event event = getEventEntity(eventId);
        eventRepository.delete(event);
    }

    private Event getEventEntity(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
    }

    private void validateEventTime(EventRequest request) {
        if (request.endTime() != null && request.endTime().isBefore(request.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }
}
