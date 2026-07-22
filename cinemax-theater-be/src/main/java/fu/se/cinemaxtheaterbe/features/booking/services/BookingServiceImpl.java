package fu.se.cinemaxtheaterbe.features.booking.services;

import fu.se.cinemaxtheaterbe.entity.user.User;
import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import fu.se.cinemaxtheaterbe.entity.booking.Booking;
import fu.se.cinemaxtheaterbe.entity.booking.BookingFood;
import fu.se.cinemaxtheaterbe.entity.booking.Payment;
import fu.se.cinemaxtheaterbe.entity.movie.Schedule;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.entity.theater.TheaterStock;
import fu.se.cinemaxtheaterbe.entity.booking.Ticket;
import fu.se.cinemaxtheaterbe.features.auth.repositories.UserRepository;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingRequest;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingResponse;
import fu.se.cinemaxtheaterbe.features.booking.dtos.ScheduleSeatResponse;
import fu.se.cinemaxtheaterbe.features.booking.repositories.BookingFoodRepository;
import fu.se.cinemaxtheaterbe.features.booking.repositories.BookingRepository;
import fu.se.cinemaxtheaterbe.features.booking.repositories.TicketRepository;
import fu.se.cinemaxtheaterbe.features.fooddrink.repositories.TheaterStockRepository;
import fu.se.cinemaxtheaterbe.features.movieschedule.repositories.MovieScheduleRepository;
import fu.se.cinemaxtheaterbe.features.payment.repositories.PaymentRepository;
import fu.se.cinemaxtheaterbe.features.payment.services.PaymentService;
import fu.se.cinemaxtheaterbe.features.room.repositories.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final BookingFoodRepository bookingFoodRepository;
    private final MovieScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final TheaterStockRepository stockRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleSeatResponse> getScheduleSeats(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        List<Seat> seats = seatRepository.findByRoomId(schedule.getRoom().getId());
        List<Long> occupiedSeatIds = ticketRepository.findOccupiedSeatIdsByScheduleId(scheduleId);

        BigDecimal basePrice = schedule.getPrice() != null ? schedule.getPrice() : new BigDecimal("90000");

        return seats.stream().map(seat -> {
            BigDecimal seatPrice = calculateSeatPrice(basePrice, seat.getSeatType());
            boolean isOccupied = occupiedSeatIds.contains(seat.getId());
            return ScheduleSeatResponse.builder()
                    .seatId(seat.getId())
                    .seatRow(seat.getSeatRow())
                    .seatColumn(seat.getSeatColumn())
                    .seatType(seat.getSeatType().name())
                    .status(seat.getStatus().name())
                    .price(seatPrice)
                    .occupied(isOccupied)
                    .build();
        }).toList();
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String ipAddress, String username) {
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found: " + username));

        List<Long> occupiedSeatIds = ticketRepository.findOccupiedSeatIdsByScheduleId(schedule.getId());
        BigDecimal basePrice = schedule.getPrice() != null ? schedule.getPrice() : new BigDecimal("90000");

        Booking booking = Booking.builder()
                .schedule(schedule)
                .user(user)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .bookingDate(LocalDateTime.now())
                .status("PENDING")
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<Ticket> tickets = new ArrayList<>();

        for (Long seatId : request.getSeatIds()) {
            if (occupiedSeatIds.contains(seatId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat " + seatId + " is already booked");
            }
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seat not found: " + seatId));

            if (!seat.getRoom().getId().equals(schedule.getRoom().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Seat " + seatId + " does not belong to this schedule's room");
            }

            BigDecimal seatPrice = calculateSeatPrice(basePrice, seat.getSeatType());
            totalAmount = totalAmount.add(seatPrice);

            tickets.add(Ticket.builder()
                    .booking(booking)
                    .seat(seat)
                    .price(seatPrice)
                    .build());
        }

        List<BookingFood> foods = new ArrayList<>();
        if (request.getFoods() != null) {
            for (BookingRequest.FoodItemRequest foodReq : request.getFoods()) {
                TheaterStock foodItem = stockRepository.findByIdAndDeletedFalse(foodReq.getFoodDrinkId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Snack/Drink item not found: " + foodReq.getFoodDrinkId()));

                if (foodItem.getQuantityInStock() < foodReq.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Insufficient stock for " + foodItem.getItemName());
                }

                BigDecimal foodCost = foodItem.getPrice().multiply(new BigDecimal(foodReq.getQuantity()));
                totalAmount = totalAmount.add(foodCost);

                foods.add(BookingFood.builder()
                        .booking(booking)
                        .foodDrink(foodItem)
                        .quantity(foodReq.getQuantity())
                        .price(foodItem.getPrice())
                        .build());
            }
        }

        booking.setTotalAmount(totalAmount);
        booking.setTickets(tickets);
        booking.setFoods(foods);

        Booking savedBooking = bookingRepository.save(booking);

        String txnRef = "CINEMAX" + System.currentTimeMillis() + new Random().nextInt(1000);
        Payment payment = Payment.builder()
                .booking(savedBooking)
                .paymentStatus("PENDING")
                .paymentMethod("VNPAY")
                .txnRef(txnRef)
                .build();
        paymentRepository.save(payment);
        savedBooking.setPayment(payment);

        String orderInfo = "Thanh toan ve xem phim Cinemax. Ma dat ve: " + txnRef;
        String paymentUrl = paymentService.buildPaymentUrl(txnRef, savedBooking.getTotalAmount(), orderInfo, ipAddress);

        return mapToResponse(savedBooking, paymentUrl);
    }

    @Override
    @Transactional
    public BookingResponse verifyPayment(Map<String, String> vnpayParams) {
        String txnRef = vnpayParams.get("vnp_TxnRef");
        if (txnRef == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing transaction reference");
        }

        Payment payment = paymentRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking not found for reference: " + txnRef));
        Booking booking = payment.getBooking();

        if (!booking.getStatus().equals("PENDING")) {
            return mapToResponse(booking, null);
        }

        boolean isValidSignature = paymentService.verifySignature(vnpayParams);
        if (!isValidSignature) {
            log.error("Invalid VNPAY signature for txnRef: {}", txnRef);
            payment.setPaymentStatus("FAILED");
            booking.setStatus("CANCELLED");
            paymentRepository.save(payment);
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Signature verification failed");
        }

        String responseCode = vnpayParams.get("vnp_ResponseCode");
        String payDate = vnpayParams.get("vnp_PayDate");

        if ("00".equals(responseCode)) {
            payment.setPaymentStatus("PAID");
            payment.setPayDate(payDate);
            booking.setStatus("CONFIRMED");

            // Deduct food stocks
            if (booking.getFoods() != null) {
                for (BookingFood bookingFood : booking.getFoods()) {
                    TheaterStock foodItem = bookingFood.getFoodDrink();
                    int newQty = foodItem.getQuantityInStock() - bookingFood.getQuantity();
                    if (newQty < 0) {
                        newQty = 0;
                    }
                    foodItem.setQuantityInStock(newQty);
                    stockRepository.save(foodItem);
                }
            }
        } else {
            payment.setPaymentStatus("FAILED");
            payment.setPayDate(payDate);
            booking.setStatus("CANCELLED");
        }

        paymentRepository.save(payment);
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingHistory(String username) {
        return bookingRepository.findByUser_UsernameOrderByBookingDateDesc(username).stream()
                .map(booking -> mapToResponse(booking, null))
                .toList();
    }

    private BigDecimal calculateSeatPrice(BigDecimal basePrice, SeatType seatType) {
        if (seatType == SeatType.VIP) {
            return basePrice.add(new BigDecimal("20000"));
        }
        return basePrice;
    }

    private BookingResponse mapToResponse(Booking booking, String paymentUrl) {
        List<String> seatCodes = booking.getTickets().stream()
                .map(t -> t.getSeat().getSeatRow() + t.getSeat().getSeatColumn())
                .toList();

        List<BookingResponse.FoodItemResponse> foodResponses = booking.getFoods().stream()
                .map(f -> BookingResponse.FoodItemResponse.builder()
                        .itemName(f.getFoodDrink().getItemName())
                        .quantity(f.getQuantity())
                        .price(f.getPrice())
                        .build())
                .toList();

        Schedule schedule = booking.getSchedule();
        String showtime = schedule.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
        Payment payment = booking.getPayment();

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .txnRef(payment != null ? payment.getTxnRef() : null)
                .movieTitle(schedule.getMovie().getTitle())
                .roomName(schedule.getRoom().getName())
                .showtime(showtime)
                .fullName(booking.getFullName())
                .email(booking.getEmail())
                .phone(booking.getPhone())
                .seatCodes(seatCodes)
                .foods(foodResponses)
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .paymentStatus(payment != null ? payment.getPaymentStatus() : null)
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .payDate(payment != null ? payment.getPayDate() : null)
                .bookingDate(booking.getBookingDate())
                .paymentUrl(paymentUrl)
                .build();
    }
}
