package fu.se.cinemaxtheaterbe.features.booking.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByTxnRef(String txnRef);

    List<Booking> findByUser_UsernameOrderByBookingDateDesc(String username);

    boolean existsBySchedule_Id(Long scheduleId);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.schedule.movie.id = :movieId AND b.schedule.startTime > :now
            """)
    List<Booking> findByMovieIdAndUpcomingSchedule(@Param("movieId") Long movieId, @Param("now") LocalDateTime now);
}
