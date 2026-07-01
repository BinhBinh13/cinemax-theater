package fu.se.cinemaxtheaterbe.features.movie.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.MovieStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {

    private Long id;
    private String title;
    private Integer durationMinutes;
    private String description;
    private String posterUrl;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private MovieStatus status;
}
