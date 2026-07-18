package fu.se.cinemaxtheaterbe.features.room.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {

    @NotBlank(message = "Room name is required")
    private String name;

    @NotNull(message = "Row count is required")
    private Integer rowCount;

    @NotNull(message = "Column count is required")
    private Integer columnCount;

    private RoomStatus status;
}
