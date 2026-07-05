package fu.se.cinemaxtheaterbe.features.movie.mappers;

import fu.se.cinemaxtheaterbe.entity.Movie;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieRequest;
import fu.se.cinemaxtheaterbe.features.movie.dtos.MovieResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MovieMapper {

    MovieResponse toResponse(Movie movie);

    Movie toEntity(MovieRequest request);

    void updateEntityFromRequest(MovieRequest request, @MappingTarget Movie movie);
}
