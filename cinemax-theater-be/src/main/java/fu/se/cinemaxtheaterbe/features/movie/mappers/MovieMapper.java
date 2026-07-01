package fu.se.cinemaxtheaterbe.features.movie.mappers;

import fu.se.cinemaxtheaterbe.entity.Movie;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MovieMapper {

    MovieResponse toResponse(Movie movie);
}
