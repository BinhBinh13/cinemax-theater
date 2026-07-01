package fu.se.cinemaxtheaterbe.features.movieschedule.mappers;

import fu.se.cinemaxtheaterbe.entity.theater.Schedule;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {

    @Mapping(target = "movieId", source = "movie.id")
    @Mapping(target = "movieTitle", source = "movie.title")
    @Mapping(target = "roomId", source = "room.id")
    @Mapping(target = "roomName", source = "room.name")
    ScheduleResponse toResponse(Schedule schedule);
}
