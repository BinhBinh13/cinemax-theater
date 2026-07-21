package fu.se.cinemaxtheaterbe.features.booking.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long bookingId;
    private String username;
    private Long movieId;
    private String movieTitle;
    private Long roomId;
    private String roomName;
    private LocalDateTime startTime;
    private LocalDateTime bookingTime;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String paymentMethod;
    private List<TicketResponse> tickets;
}
