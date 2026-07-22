package fu.se.cinemaxtheaterbe.features.movieschedule.repositories;

import fu.se.cinemaxtheaterbe.entity.movie.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface MovieScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByMovieIdOrderByStartTimeAsc(Long movieId);

    @Query("""
            SELECT s FROM Schedule s
            WHERE s.room.id = :roomId
              AND (:excludeId IS NULL OR s.id <> :excludeId)
              AND s.startTime < :checkEnd
              AND s.endTime > :checkStart
            """)
    List<Schedule> findConflictingSchedules(@Param("roomId") Long roomId,
                                             @Param("checkStart") LocalDateTime checkStart,
                                             @Param("checkEnd") LocalDateTime checkEnd,
                                             @Param("excludeId") Long excludeId);
}
