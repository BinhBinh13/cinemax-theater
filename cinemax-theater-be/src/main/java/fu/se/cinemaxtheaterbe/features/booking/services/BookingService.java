package fu.se.cinemaxtheaterbe.features.booking.services;

import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingRequest;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingResponse;
import fu.se.cinemaxtheaterbe.features.booking.dtos.ScheduleSeatResponse;

import java.util.List;
import java.util.Map;

public interface BookingService {
    List<ScheduleSeatResponse> getScheduleSeats(Long scheduleId);
    BookingResponse createBooking(BookingRequest request, String ipAddress);
    BookingResponse verifyPayment(Map<String, String> vnpayParams);
}
