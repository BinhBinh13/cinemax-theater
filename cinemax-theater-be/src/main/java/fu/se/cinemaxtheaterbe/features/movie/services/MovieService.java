package fu.se.cinemaxtheaterbe.features.movie.services;

import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieResponse;

import java.util.List;

public interface MovieService {

    List<MovieResponse> getAllMovies();

    MovieResponse getMovieById(Long id);
}
