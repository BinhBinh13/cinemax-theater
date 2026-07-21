package fu.se.cinemaxtheaterbe.features.movieschedule.services;

import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleRequest;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleResponse;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface MovieScheduleService {

    List<ScheduleResponse> getSchedulesByMovie(Long movieId);

    ScheduleResponse getScheduleById(Long id);

    ScheduleResponse createSchedule(ScheduleRequest request);

    ScheduleResponse updateSchedule(Long id, ScheduleRequest request);

    void deleteSchedule(Long id);

    List<RoomResponse> getAvailableRooms(Long movieId, LocalDate date, LocalTime startTime, Long excludeScheduleId);
}
