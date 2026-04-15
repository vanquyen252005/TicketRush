package com.example.ticketRush.EventModule.Controller;

import com.example.ticketRush.EventModule.Dto.Request.EventRequest;
import com.example.ticketRush.EventModule.Dto.Response.EventResponse;
import com.example.ticketRush.EventModule.Service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/events")
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"})
@Tag(name = "Admin Events", description = "Cac API quan ly su kien cho admin")
@SecurityRequirement(name = "bearerAuth")
public class EventController {
    private final EventService eventService;

    @Operation(summary = "Lay danh sach su kien", description = "Tra ve toan bo su kien trong he thong.")
    @ApiResponse(responseCode = "200", description = "Lay danh sach thanh cong")
    @GetMapping
    public List<EventResponse> getAllEvents() {
        return eventService.getAllEvents();
    }

    @Operation(summary = "Lay chi tiet su kien", description = "Tra ve chi tiet su kien theo id.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lay chi tiet thanh cong"),
            @ApiResponse(responseCode = "404", description = "Khong tim thay su kien")
    })
    @GetMapping("/{eventId}")
    public EventResponse getEvent(@PathVariable Long eventId) {
        return eventService.getEventById(eventId);
    }

    @Operation(summary = "Tao su kien moi", description = "Tao moi mot su kien danh cho admin.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tao su kien thanh cong"),
            @ApiResponse(responseCode = "400", description = "Du lieu khong hop le")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Thong tin su kien can tao",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "name": "Live Concert 2026",
                                              "description": "Dem nhac ngoai troi",
                                              "location": "Quan 1, TP.HCM",
                                              "imageUrl": "https://example.com/banner.jpg",
                                              "startTime": "2026-05-01T19:30:00",
                                              "endTime": "2026-05-01T22:00:00",
                                              "status": "PUBLISHED"
                                            }
                                            """
                            )
                    )
            )
            @Valid @RequestBody EventRequest request) {
        return eventService.createEvent(request);
    }

    @Operation(summary = "Cap nhat su kien", description = "Cap nhat thong tin mot su kien theo id.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cap nhat thanh cong"),
            @ApiResponse(responseCode = "400", description = "Du lieu khong hop le"),
            @ApiResponse(responseCode = "404", description = "Khong tim thay su kien")
    })
    @PutMapping("/{eventId}")
    public EventResponse updateEvent(@PathVariable Long eventId, @Valid @RequestBody EventRequest request) {
        return eventService.updateEvent(eventId, request);
    }

    @Operation(summary = "Xoa su kien", description = "Xoa mot su kien theo id.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xoa thanh cong"),
            @ApiResponse(responseCode = "404", description = "Khong tim thay su kien")
    })
    @DeleteMapping("/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
    }
}
