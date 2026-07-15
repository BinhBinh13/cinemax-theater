package fu.se.cinemaxtheaterbe.features.booking.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private Long ticketId;
    private Long seatId;
    private String seatRow;
    private Integer seatColumn;
    private SeatType seatType;
    private BigDecimal price;
}
