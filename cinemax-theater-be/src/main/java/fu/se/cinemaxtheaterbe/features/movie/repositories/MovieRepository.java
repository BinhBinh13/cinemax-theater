package fu.se.cinemaxtheaterbe.features.movie.repositories;

import fu.se.cinemaxtheaterbe.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    List<Movie> findByDeletedFalse();

    Optional<Movie> findByIdAndDeletedFalse(Long id);
}
