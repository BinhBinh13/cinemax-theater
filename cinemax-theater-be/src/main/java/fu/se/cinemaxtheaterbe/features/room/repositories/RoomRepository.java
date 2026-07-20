package fu.se.cinemaxtheaterbe.features.room.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT r FROM Room r WHERE r.deleted = false")
    List<Room> findAllActive();

    @Query("SELECT r FROM Room r WHERE r.id = :id AND r.deleted = false")
    Optional<Room> findByIdActive(@Param("id") Long id);

    List<Room> findByTheaterIdAndDeletedFalse(Long theaterId);

    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);

    boolean existsByNameIgnoreCaseAndDeletedFalseAndIdNot(String name, Long id);
}
