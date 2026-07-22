package fu.se.cinemaxtheaterbe.features.movie.mappers;

import fu.se.cinemaxtheaterbe.entity.movie.Movie;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieRequest;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MovieMapper {

    MovieResponse toResponse(Movie movie);

    @Mapping(target = "genres", ignore = true)
    Movie toEntity(MovieRequest request);

    @Mapping(target = "genres", ignore = true)
    void updateEntity(@MappingTarget Movie movie, MovieRequest request);
}
