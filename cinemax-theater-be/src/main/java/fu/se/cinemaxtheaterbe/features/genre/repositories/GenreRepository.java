package fu.se.cinemaxtheaterbe.features.genre.repositories;

import fu.se.cinemaxtheaterbe.entity.movie.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenreRepository extends JpaRepository<Genre, Long> {
}
