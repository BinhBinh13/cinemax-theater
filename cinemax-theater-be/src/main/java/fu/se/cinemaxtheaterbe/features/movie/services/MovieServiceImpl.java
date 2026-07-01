package fu.se.cinemaxtheaterbe.features.movie.services;

import fu.se.cinemaxtheaterbe.exception.ResourceNotFoundException;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieResponse;
import fu.se.cinemaxtheaterbe.features.movie.mappers.MovieMapper;
import fu.se.cinemaxtheaterbe.features.movie.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found: " + id));
    }
}
