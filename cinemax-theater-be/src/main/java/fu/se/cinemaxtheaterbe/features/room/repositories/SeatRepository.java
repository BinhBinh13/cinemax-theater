package fu.se.cinemaxtheaterbe.features.room.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomId(Long roomId);
}
