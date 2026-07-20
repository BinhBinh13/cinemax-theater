package fu.se.cinemaxtheaterbe.features.room.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDetailResponse {

    private Long id;
    private String name;
    private Integer rowCount;
    private Integer columnCount;
    private RoomStatus status;
    private Long theaterId;
    private String theaterName;
    private int seatCount;
    private List<SeatResponse> seats;
}
