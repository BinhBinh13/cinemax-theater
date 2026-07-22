package fu.se.cinemaxtheaterbe.features.booking.controllers;

import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingRequest;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingResponse;
import fu.se.cinemaxtheaterbe.features.booking.dtos.ScheduleSeatResponse;
import fu.se.cinemaxtheaterbe.features.booking.services.BookingService;
import fu.se.cinemaxtheaterbe.utils.ApiPath;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(ApiPath.BOOKINGS)
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/schedules/{scheduleId}/seats")
    public ResponseEntity<List<ScheduleSeatResponse>> getScheduleSeats(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(bookingService.getScheduleSeats(scheduleId));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request,
                                                         HttpServletRequest servletRequest,
                                                         Principal principal) {
        String ipAddress = servletRequest.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = servletRequest.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, ipAddress, principal.getName()));
    }

    @GetMapping("/verify-payment")
    public ResponseEntity<BookingResponse> verifyPayment(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(bookingService.verifyPayment(params));
    }

    @GetMapping("/history")
    public ResponseEntity<List<BookingResponse>> getBookingHistory(Principal principal) {
        return ResponseEntity.ok(bookingService.getBookingHistory(principal.getName()));
    }
}
