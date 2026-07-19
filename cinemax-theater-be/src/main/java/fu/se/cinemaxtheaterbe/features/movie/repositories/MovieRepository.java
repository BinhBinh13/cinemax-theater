package fu.se.cinemaxtheaterbe.features.movie.repositories;

import fu.se.cinemaxtheaterbe.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> {
}
