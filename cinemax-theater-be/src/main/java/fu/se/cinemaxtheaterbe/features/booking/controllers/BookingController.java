package fu.se.cinemaxtheaterbe.features.booking.controllers;

import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingRequest;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingResponse;
import fu.se.cinemaxtheaterbe.features.booking.services.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/schedules/{scheduleId}/occupied-seats")
    public ResponseEntity<List<Long>> getOccupiedSeats(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(bookingService.getOccupiedSeatIds(scheduleId));
    }

    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request, username));
    }

    @GetMapping("/bookings/history")
    public ResponseEntity<List<BookingResponse>> getBookingHistory(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        return ResponseEntity.ok(bookingService.getUserBookingHistory(username));
    }
}
