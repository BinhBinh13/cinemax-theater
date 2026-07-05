package fu.se.cinemaxtheaterbe.features.movie.services;

import fu.se.cinemaxtheaterbe.entity.Movie;
import fu.se.cinemaxtheaterbe.entity.enums.MovieStatus;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieRequest;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieResponse;
import fu.se.cinemaxtheaterbe.features.movie.mappers.MovieMapper;
import fu.se.cinemaxtheaterbe.features.movie.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;

    @Override
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(movieMapper::toResponse)
                .toList();
    }

    @Override
    public MovieResponse getMovieById(Long id) {
        return movieRepository.findById(id)
                .map(movieMapper::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id));
    }

    @Override
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = movieMapper.toEntity(request);
        if (movie.getStatus() == null) {
            movie.setStatus(MovieStatus.ACTIVE);
        }
        movie = movieRepository.save(movie);
        return movieMapper.toResponse(movie);
    }

    @Override
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id));
        movieMapper.updateEntityFromRequest(request, movie);
        movie = movieRepository.save(movie);
        return movieMapper.toResponse(movie);
    }

    @Override
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id));
        movie.setStatus(MovieStatus.INACTIVE);
        movieRepository.save(movie);
    }
}
