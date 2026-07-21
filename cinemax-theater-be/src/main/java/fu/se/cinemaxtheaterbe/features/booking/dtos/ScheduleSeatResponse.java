package fu.se.cinemaxtheaterbe.features.booking.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSeatResponse {
    private Long seatId;
    private String seatRow;
    private Integer seatColumn;
    private String seatType;
    private String status;
    private BigDecimal price;
    private boolean occupied;
}
