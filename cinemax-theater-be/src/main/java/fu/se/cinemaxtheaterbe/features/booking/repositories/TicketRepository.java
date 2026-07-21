package fu.se.cinemaxtheaterbe.features.booking.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByScheduleId(Long scheduleId);
    boolean existsByScheduleIdAndSeatId(Long scheduleId, Long seatId);
}
