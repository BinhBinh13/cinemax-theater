package fu.se.cinemaxtheaterbe.features.movieschedule.services;

import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleRequest;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleResponse;

import java.util.List;

public interface MovieScheduleService {

    List<ScheduleResponse> getSchedulesByMovie(Long movieId);

    ScheduleResponse getScheduleById(Long id);

    ScheduleResponse createSchedule(ScheduleRequest request);

    ScheduleResponse updateSchedule(Long id, ScheduleRequest request);

    void deleteSchedule(Long id);
}
