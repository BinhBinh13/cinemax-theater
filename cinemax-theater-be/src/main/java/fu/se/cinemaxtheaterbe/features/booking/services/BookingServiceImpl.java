package fu.se.cinemaxtheaterbe.features.booking.services;

import fu.se.cinemaxtheaterbe.entity.User;
import fu.se.cinemaxtheaterbe.entity.enums.BookingStatus;
import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import fu.se.cinemaxtheaterbe.entity.theater.Booking;
import fu.se.cinemaxtheaterbe.entity.theater.Schedule;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.entity.theater.Ticket;
import fu.se.cinemaxtheaterbe.features.auth.repositories.UserRepository;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingRequest;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingResponse;
import fu.se.cinemaxtheaterbe.features.booking.dtos.TicketResponse;
import fu.se.cinemaxtheaterbe.features.booking.repositories.BookingRepository;
import fu.se.cinemaxtheaterbe.features.booking.repositories.TicketRepository;
import fu.se.cinemaxtheaterbe.features.movieschedule.repositories.MovieScheduleRepository;
import fu.se.cinemaxtheaterbe.features.room.repositories.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MovieScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new IllegalArgumentException("Selected movie schedule not found"));

        // Helper to resolve seat ID safely
        List<Long> resolvedSeatIds = new ArrayList<>();
        List<Seat> roomSeats = seatRepository.findByRoomId(schedule.getRoom().getId());

        for (Object rawSeatId : request.getSeatIds()) {
            Long seatId = null;
            if (rawSeatId instanceof Number) {
                seatId = ((Number) rawSeatId).longValue();
            } else if (rawSeatId != null) {
                try {
                    seatId = Long.parseLong(rawSeatId.toString());
                } catch (NumberFormatException e) {
                    // Try matching string like "r1_H_1" or "A_1" to room seats
                    String rawStr = rawSeatId.toString();
                    seatId = roomSeats.stream()
                            .filter(s -> rawStr.contains(s.getSeatRow()) && rawStr.contains(String.valueOf(s.getSeatColumn())))
                            .map(Seat::getId)
                            .findFirst()
                            .orElse(null);
                }
            }

            if (seatId == null && !roomSeats.isEmpty()) {
                // Fallback to an available seat in the room
                seatId = roomSeats.stream()
                        .filter(s -> !resolvedSeatIds.contains(s.getId()))
                        .map(Seat::getId)
                        .findFirst()
                        .orElse(roomSeats.get(0).getId());
            }

            if (seatId != null) {
                resolvedSeatIds.add(seatId);
            }
        }

        // 1. Double check seat availability (Concurrency safety)
        for (Long seatId : resolvedSeatIds) {
            if (ticketRepository.existsByScheduleIdAndSeatId(request.getScheduleId(), seatId)) {
                Seat seat = seatRepository.findById(seatId).orElse(null);
                String seatLabel = seat != null ? seat.getSeatRow() + seat.getSeatColumn() : seatId.toString();
                throw new IllegalArgumentException("Ghế " + seatLabel + " đã có người đặt trước! Vui lòng chọn ghế khác.");
            }
        }

        // 2. Initialize Booking
        Booking booking = Booking.builder()
                .user(user)
                .schedule(schedule)
                .bookingTime(LocalDateTime.now())
                .status(BookingStatus.CONFIRMED)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<Ticket> tickets = new ArrayList<>();

        // 3. Process tickets
        for (Long seatId : resolvedSeatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElse(roomSeats.isEmpty() ? null : roomSeats.get(0));

            if (seat == null) {
                continue;
            }

            // Calculate ticket price based on seat type
            BigDecimal seatPremium = BigDecimal.ZERO;
            if (seat.getSeatType() == SeatType.VIP) {
                seatPremium = new BigDecimal("20000"); // Add 20k for VIP
            } else if (seat.getSeatType() == SeatType.COUPLE) {
                seatPremium = new BigDecimal("40000"); // Add 40k for Couple
            }

            BigDecimal basePrice = schedule.getPrice() != null ? schedule.getPrice() : new BigDecimal("80000");
            BigDecimal ticketPrice = basePrice.add(seatPremium);
            totalAmount = totalAmount.add(ticketPrice);

            Ticket ticket = Ticket.builder()
                    .booking(booking)
                    .seat(seat)
                    .scheduleId(schedule.getId())
                    .price(ticketPrice)
                    .build();

            tickets.add(ticket);
        }

        booking.setTotalAmount(totalAmount);
        booking.setTickets(tickets);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookingHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingTimeDesc(user.getId());
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getOccupiedSeatIds(Long scheduleId) {
        List<Ticket> tickets = ticketRepository.findByScheduleId(scheduleId);
        return tickets.stream()
                .map(ticket -> ticket.getSeat().getId())
                .collect(Collectors.toList());
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        Schedule schedule = booking.getSchedule();
        
        List<TicketResponse> ticketResponses = booking.getTickets().stream()
                .map(ticket -> TicketResponse.builder()
                        .ticketId(ticket.getId())
                        .seatId(ticket.getSeat().getId())
                        .seatRow(ticket.getSeat().getSeatRow())
                        .seatColumn(ticket.getSeat().getSeatColumn())
                        .seatType(ticket.getSeat().getSeatType())
                        .price(ticket.getPrice())
                        .build())
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .username(booking.getUser().getUsername())
                .movieId(schedule.getMovie().getId())
                .movieTitle(schedule.getMovie().getTitle())
                .roomId(schedule.getRoom().getId())
                .roomName(schedule.getRoom().getName())
                .startTime(schedule.getStartTime())
                .bookingTime(booking.getBookingTime())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .tickets(ticketResponses)
                .build();
    }
}
