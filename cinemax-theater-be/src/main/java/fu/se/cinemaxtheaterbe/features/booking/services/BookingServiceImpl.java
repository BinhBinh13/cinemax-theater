package fu.se.cinemaxtheaterbe.features.booking.services;

import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import fu.se.cinemaxtheaterbe.entity.theater.Booking;
import fu.se.cinemaxtheaterbe.entity.theater.BookingFood;
import fu.se.cinemaxtheaterbe.entity.theater.Schedule;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.entity.theater.TheaterStock;
import fu.se.cinemaxtheaterbe.entity.theater.Ticket;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingRequest;
import fu.se.cinemaxtheaterbe.features.booking.dtos.BookingResponse;
import fu.se.cinemaxtheaterbe.features.booking.dtos.ScheduleSeatResponse;
import fu.se.cinemaxtheaterbe.features.booking.repositories.BookingFoodRepository;
import fu.se.cinemaxtheaterbe.features.booking.repositories.BookingRepository;
import fu.se.cinemaxtheaterbe.features.booking.repositories.TicketRepository;
import fu.se.cinemaxtheaterbe.features.booking.utils.VnPayUtil;
import fu.se.cinemaxtheaterbe.features.fooddrink.repositories.TheaterStockRepository;
import fu.se.cinemaxtheaterbe.features.movieschedule.repositories.MovieScheduleRepository;
import fu.se.cinemaxtheaterbe.features.room.repositories.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

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
    public BookingResponse createBooking(BookingRequest request, String ipAddress) {
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        List<Long> occupiedSeatIds = ticketRepository.findOccupiedSeatIdsByScheduleId(schedule.getId());
        BigDecimal basePrice = schedule.getPrice() != null ? schedule.getPrice() : new BigDecimal("90000");

        Booking booking = Booking.builder()
                .schedule(schedule)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .bookingDate(LocalDateTime.now())
                .paymentStatus("PENDING")
                .paymentMethod("VNPAY")
                .status("PENDING")
                .txnRef("CINEMAX" + System.currentTimeMillis() + new Random().nextInt(1000))
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

        String paymentUrl = buildVnPayUrl(savedBooking, ipAddress);

        return mapToResponse(savedBooking, paymentUrl);
    }

    @Override
    @Transactional
    public BookingResponse verifyPayment(Map<String, String> vnpayParams) {
        String txnRef = vnpayParams.get("vnp_TxnRef");
        if (txnRef == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing transaction reference");
        }

        Booking booking = bookingRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking not found for reference: " + txnRef));

        if (!booking.getStatus().equals("PENDING")) {
            return mapToResponse(booking, null);
        }

        boolean isValidSignature = verifyVnPaySignature(vnpayParams);
        if (!isValidSignature) {
            log.error("Invalid VNPAY signature for txnRef: {}", txnRef);
            booking.setPaymentStatus("FAILED");
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Signature verification failed");
        }

        String responseCode = vnpayParams.get("vnp_ResponseCode");
        String payDate = vnpayParams.get("vnp_PayDate");

        if ("00".equals(responseCode)) {
            booking.setPaymentStatus("PAID");
            booking.setStatus("CONFIRMED");
            booking.setPayDate(payDate);

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
            booking.setPaymentStatus("FAILED");
            booking.setStatus("CANCELLED");
            booking.setPayDate(payDate);
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking, null);
    }

    private BigDecimal calculateSeatPrice(BigDecimal basePrice, SeatType seatType) {
        if (seatType == SeatType.VIP) {
            return basePrice.add(new BigDecimal("20000"));
        } else if (seatType == SeatType.COUPLE) {
            return basePrice.multiply(new BigDecimal("2"));
        }
        return basePrice;
    }

    private String buildVnPayUrl(Booking booking, String ipAddress) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = booking.getTxnRef();
        String vnp_OrderInfo = "Thanh toan ve xem phim Cinemax. Ma dat ve: " + booking.getTxnRef();
        String vnp_OrderType = "other";
        String vnp_Locale = "vn";

        long amountInCents = booking.getTotalAmount().multiply(new BigDecimal("100")).longValue();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountInCents));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", LocalDateTime.now().format(formatter));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String secureHash = VnPayUtil.hmacSHA512(hashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + secureHash;

        return vnpayUrl + "?" + queryUrl;
    }

    private boolean verifyVnPaySignature(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null) {
            return false;
        }

        Map<String, String> filterParams = new HashMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String val = entry.getValue();
            if (key != null && !key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType") && val != null
                    && !val.isEmpty()) {
                filterParams.put(key, val);
            }
        }

        List<String> fieldNames = new ArrayList<>(filterParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = filterParams.get(fieldName);
            sb.append(fieldName);
            sb.append('=');
            sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            if (itr.hasNext()) {
                sb.append('&');
            }
        }

        String computedHash = VnPayUtil.hmacSHA512(hashSecret, sb.toString());
        return computedHash.equalsIgnoreCase(secureHash);
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

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .txnRef(booking.getTxnRef())
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
                .paymentStatus(booking.getPaymentStatus())
                .paymentUrl(paymentUrl)
                .build();
    }
}
