package fu.se.cinemaxtheaterbe.features.movie.services;

import fu.se.cinemaxtheaterbe.entity.Genre;
import fu.se.cinemaxtheaterbe.entity.Movie;
import fu.se.cinemaxtheaterbe.entity.enums.MovieStatus;
import fu.se.cinemaxtheaterbe.features.booking.repositories.BookingRepository;
import fu.se.cinemaxtheaterbe.features.genre.repositories.GenreRepository;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieRequest;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieResponse;
import fu.se.cinemaxtheaterbe.features.movie.mappers.MovieMapper;
import fu.se.cinemaxtheaterbe.features.movie.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;
    private final GenreRepository genreRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findByDeletedFalse().stream()
                .map(movieMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        return movieRepository.findByIdAndDeletedFalse(id)
                .map(movieMapper::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id));
    }

    @Override
    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = movieMapper.toEntity(request);
        if (movie.getStatus() == null) {
            movie.setStatus(MovieStatus.COMING_SOON);
        }
        movie.setGenres(resolveGenres(request.getGenreIds()));
        return movieMapper.toResponse(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id));
        if (hasUpcomingBookedSchedule(movie)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot edit movie \"" + movie.getTitle() + "\": it has an upcoming schedule that already has bookings.");
        }
        movieMapper.updateEntity(movie, request);
        movie.setGenres(resolveGenres(request.getGenreIds()));
        return movieMapper.toResponse(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id));
        if (hasUpcomingBookedSchedule(movie)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete movie \"" + movie.getTitle() + "\": it has an upcoming schedule that already has bookings.");
        }
        movie.setDeleted(true);
        movie.setDeletedAt(LocalDateTime.now());
        movieRepository.save(movie);
    }

    private boolean hasUpcomingBookedSchedule(Movie movie) {
        return !bookingRepository.findByMovieIdAndUpcomingSchedule(movie.getId(), LocalDateTime.now()).isEmpty();
    }

    private List<Genre> resolveGenres(List<Long> genreIds) {
        if (genreIds == null || genreIds.isEmpty()) return new ArrayList<>();
        return genreRepository.findAllById(genreIds);
    }
}
