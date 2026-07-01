package fu.se.cinemaxtheaterbe.features.movieschedule.services;

import fu.se.cinemaxtheaterbe.entity.Movie;
import fu.se.cinemaxtheaterbe.entity.enums.MovieScheduleStatus;
import fu.se.cinemaxtheaterbe.entity.enums.RoomStatus;
import fu.se.cinemaxtheaterbe.entity.theater.Room;
import fu.se.cinemaxtheaterbe.entity.theater.Schedule;
import fu.se.cinemaxtheaterbe.exception.BusinessRuleException;
import fu.se.cinemaxtheaterbe.exception.ResourceNotFoundException;
import fu.se.cinemaxtheaterbe.features.movie.repositories.MovieRepository;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleRequest;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleResponse;
import fu.se.cinemaxtheaterbe.features.movieschedule.mappers.ScheduleMapper;
import fu.se.cinemaxtheaterbe.features.movieschedule.repositories.MovieScheduleRepository;
import fu.se.cinemaxtheaterbe.features.room.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieScheduleServiceImpl implements MovieScheduleService {


    private final MovieScheduleRepository scheduleRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final ScheduleMapper scheduleMapper;

    @Override
    @Transactional
    public List<ScheduleResponse> getSchedulesByMovie(Long movieId) {
        List<Schedule> schedules = scheduleRepository.findByMovieIdOrderByStartTimeAsc(movieId);
        schedules.forEach(this::refreshStatus);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ScheduleResponse getScheduleById(Long id) {
        Schedule schedule = findScheduleOrThrow(id);
        refreshStatus(schedule);
        return scheduleMapper.toResponse(schedule);
    }

    @Override
    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        Movie movie = findMovieOrThrow(request.getMovieId());
        Room room = findRoomOrThrow(request.getRoomId());

        LocalDateTime startTime = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime endTime = computeEndTime(movie, startTime);

        validateScreeningWindow(movie, request.getDate());
        validateRoomActive(room);
        validateNoConflict(room.getId(), startTime, endTime, null);

        Schedule schedule = Schedule.builder()
                .movie(movie)
                .room(room)
                .startTime(startTime)
                .endTime(endTime)
                .status(computeStatus(startTime, endTime))
                .build();

        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public ScheduleResponse updateSchedule(Long id, ScheduleRequest request) {
        Schedule schedule = findScheduleOrThrow(id);
        refreshStatus(schedule);
        validateUpcoming(schedule);

        Movie movie = findMovieOrThrow(request.getMovieId());
        Room room = findRoomOrThrow(request.getRoomId());

        LocalDateTime startTime = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime endTime = computeEndTime(movie, startTime);

        validateScreeningWindow(movie, request.getDate());
        validateRoomActive(room);
        validateNoConflict(room.getId(), startTime, endTime, schedule.getId());

        schedule.setMovie(movie);
        schedule.setRoom(room);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setStatus(computeStatus(startTime, endTime));

        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        Schedule schedule = findScheduleOrThrow(id);
        refreshStatus(schedule);
        validateUpcoming(schedule);
        scheduleRepository.delete(schedule);
    }

    private void validateUpcoming(Schedule schedule) {
        if (schedule.getStatus() != MovieScheduleStatus.UPCOMING) {
            throw new BusinessRuleException("Only upcoming schedules can be updated or deleted");
        }
    }

    private void refreshStatus(Schedule schedule) {
        MovieScheduleStatus current = computeStatus(schedule.getStartTime(), schedule.getEndTime());
        if (schedule.getStatus() != current) {
            schedule.setStatus(current);
            scheduleRepository.save(schedule);
        }
    }

    private MovieScheduleStatus computeStatus(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startTime)) {
            return MovieScheduleStatus.UPCOMING;
        }
        if (endTime != null && now.isAfter(endTime)) {
            return MovieScheduleStatus.ENDED;
        }
        return MovieScheduleStatus.SHOWING;
    }

    private LocalDateTime computeEndTime(Movie movie, LocalDateTime startTime) {
        if (movie.getDurationMinutes() == null) {
            throw new BusinessRuleException("Movie duration is not set, cannot compute schedule end time");
        }
        return startTime.plusMinutes(movie.getDurationMinutes());
    }

    private void validateScreeningWindow(Movie movie, LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new BusinessRuleException("Schedule date cannot be in the past");
        }
        if (movie.getReleaseDate() != null && date.isBefore(movie.getReleaseDate())) {
            throw new BusinessRuleException("Schedule date is before the movie's release date");
        }
        if (movie.getEndDate() != null && date.isAfter(movie.getEndDate())) {
            throw new BusinessRuleException("Schedule date is after the movie's screening end date");
        }
    }

    private void validateRoomActive(Room room) {
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new BusinessRuleException("Room is not active");
        }
    }

    private void validateNoConflict(Long roomId, LocalDateTime startTime, LocalDateTime endTime, Long excludeId) {
        LocalDateTime checkStart = startTime.minusMinutes(15);
        LocalDateTime checkEnd = endTime.plusMinutes(15);

        List<Schedule> conflicts = scheduleRepository.findConflictingSchedules(
                roomId, checkStart, checkEnd, excludeId);
        if (!conflicts.isEmpty()) {
            throw new BusinessRuleException("Room already has a schedule overlapping this time slot");
        }
    }

    private Schedule findScheduleOrThrow(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found: " + id));
    }

    private Movie findMovieOrThrow(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found: " + id));
    }

    private Room findRoomOrThrow(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
    }
}
