package fu.se.cinemaxtheaterbe.features.room.repositories;

import fu.se.cinemaxtheaterbe.entity.enums.SeatStatus;
import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByRoomId(Long roomId);

    Optional<Seat> findByIdAndDeletedFalse(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Seat s SET s.seatType = :type WHERE s.id = :id AND s.deleted = false")
    int updateSeatType(@Param("id") Long id, @Param("type") SeatType type);

    @Modifying
    @Query("UPDATE Seat s SET s.status = :status WHERE s.id = :id AND s.deleted = false")
    int updateSeatStatus(@Param("id") Long id, @Param("status") SeatStatus status);
}
