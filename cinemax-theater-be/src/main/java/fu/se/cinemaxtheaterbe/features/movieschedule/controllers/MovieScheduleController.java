package fu.se.cinemaxtheaterbe.features.movieschedule.controllers;

import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleRequest;
import fu.se.cinemaxtheaterbe.features.movieschedule.dtos.ScheduleResponse;
import fu.se.cinemaxtheaterbe.features.movieschedule.services.MovieScheduleService;
import fu.se.cinemaxtheaterbe.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPath.SCHEDULES)
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class MovieScheduleController {

    private final MovieScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByMovie(@RequestParam Long movieId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByMovie(movieId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponse> getSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getScheduleById(id));
    }

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.createSchedule(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleResponse> updateSchedule(@PathVariable Long id,
                                                            @Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
