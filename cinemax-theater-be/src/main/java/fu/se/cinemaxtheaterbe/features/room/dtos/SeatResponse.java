package fu.se.cinemaxtheaterbe.features.room.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.SeatStatus;
import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatResponse {
    private Long id;
    private String seatRow;
    private Integer seatColumn;
    private SeatType seatType;
    private SeatStatus status;
}
