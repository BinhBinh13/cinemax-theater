package fu.se.cinemaxtheaterbe.features.movieschedule.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.MovieScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private Long id;
    private Long movieId;
    private String movieTitle;
    private Long roomId;
    private String roomName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private MovieScheduleStatus status;
}
