package fu.se.cinemaxtheaterbe.features.movieschedule.services;

import fu.se.cinemaxtheaterbe.entity.Movie;
import fu.se.cinemaxtheaterbe.entity.enums.MovieScheduleStatus;
import fu.se.cinemaxtheaterbe.entity.enums.RoomStatus;
import fu.se.cinemaxtheaterbe.entity.theater.Room;
import fu.se.cinemaxtheaterbe.entity.theater.Schedule;
import fu.se.cinemaxtheaterbe.features.booking.repositories.BookingRepository;
import fu.se.cinemaxtheaterbe.features.movie.repositories.MovieRepository;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleRequest;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleResponse;
import fu.se.cinemaxtheaterbe.features.movieschedule.mappers.ScheduleMapper;
import fu.se.cinemaxtheaterbe.features.movieschedule.repositories.MovieScheduleRepository;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomResponse;
import fu.se.cinemaxtheaterbe.features.room.mappers.RoomMapper;
import fu.se.cinemaxtheaterbe.features.room.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieScheduleServiceImpl implements MovieScheduleService {


    private final MovieScheduleRepository scheduleRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomMapper roomMapper;
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

        if (bookingRepository.existsBySchedule_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Suất chiếu đã được đặt vé, không thể chỉnh sửa.");
        }

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

        if (bookingRepository.existsBySchedule_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Suất chiếu đã được đặt vé, không thể xóa.");
        }

        scheduleRepository.delete(schedule);
    }

    private void validateUpcoming(Schedule schedule) {
        if (schedule.getStatus() != MovieScheduleStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only upcoming schedules can be updated or deleted");
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
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Movie duration is not set, cannot compute schedule end time");
        }
        return startTime.plusMinutes(movie.getDurationMinutes());
    }

    private void validateScreeningWindow(Movie movie, LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Schedule date cannot be in the past");
        }
        if (movie.getReleaseDate() != null && date.isBefore(movie.getReleaseDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Schedule date is before the movie's release date");
        }
        if (movie.getEndDate() != null && date.isAfter(movie.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Schedule date is after the movie's screening end date");
        }
    }

    private void validateRoomActive(Room room) {
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room is not active");
        }
    }

    private void validateNoConflict(Long roomId, LocalDateTime startTime, LocalDateTime endTime, Long excludeId) {
        if (hasConflict(roomId, startTime, endTime, excludeId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room already has a schedule overlapping this time slot");
        }
    }

    private boolean hasConflict(Long roomId, LocalDateTime startTime, LocalDateTime endTime, Long excludeId) {
        LocalDateTime checkStart = startTime.minusMinutes(15);
        LocalDateTime checkEnd = endTime.plusMinutes(15);
        return !scheduleRepository.findConflictingSchedules(roomId, checkStart, checkEnd, excludeId).isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRooms(Long movieId, LocalDate date, LocalTime startTime, Long excludeScheduleId) {
        Movie movie = findMovieOrThrow(movieId);
        LocalDateTime start = LocalDateTime.of(date, startTime);
        LocalDateTime end = computeEndTime(movie, start);

        return roomRepository.findAllActive().stream()
                .filter(room -> room.getStatus() == RoomStatus.ACTIVE)
                .filter(room -> !hasConflict(room.getId(), start, end, excludeScheduleId))
                .map(roomMapper::toResponse)
                .toList();
    }

    private Schedule findScheduleOrThrow(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found: " + id));
    }

    private Movie findMovieOrThrow(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id));
    }

    private Room findRoomOrThrow(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));
    }
}
