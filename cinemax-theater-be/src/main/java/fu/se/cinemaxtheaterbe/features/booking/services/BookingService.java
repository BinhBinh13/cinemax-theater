package fu.se.cinemaxtheaterbe.features.booking.services;

import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingRequest;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, String username);
    List<BookingResponse> getUserBookingHistory(String username);
    List<Long> getOccupiedSeatIds(Long scheduleId);
}
