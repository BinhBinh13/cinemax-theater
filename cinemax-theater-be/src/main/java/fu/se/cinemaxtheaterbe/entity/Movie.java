package fu.se.cinemaxtheaterbe.entity;

import fu.se.cinemaxtheaterbe.entity.enums.MovieStatus;
import fu.se.cinemaxtheaterbe.entity.theater.Schedule;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Movie that can be scheduled in screening rooms. Kept in the shared package
 * because {@link Schedule} references it; full movie management lives in its own
 * module.
 */
@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "end_date")
    private LocalDate endDate;
    /** ACTIVE / INACTIVE. */
    @Enumerated(EnumType.STRING)
    private MovieStatus status;

    @OneToMany(mappedBy = "movie")
    @Builder.Default
    private Set<Schedule> schedules = new HashSet<>();
}
