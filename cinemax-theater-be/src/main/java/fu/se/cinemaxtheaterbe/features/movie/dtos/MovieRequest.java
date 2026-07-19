package fu.se.cinemaxtheaterbe.features.movie.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.MovieStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieRequest {

    @NotBlank(message = "Movie title is required")
    private String title;

    @NotNull(message = "Duration is required")
    private Integer durationMinutes;

    @NotBlank(message = "Description is required")
    private String description;

    private String posterUrl;

    private LocalDate releaseDate;

    private LocalDate endDate;

    private String language;

    private String director;

    private String cast;

    private Double rating;

    private String bannerUrl;

    private String trailerUrl;

    @NotNull(message = "Status is required")
    private MovieStatus status;

    private List<Long> genreIds;
}
