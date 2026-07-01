package fu.se.cinemaxtheaterbe.features.room.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
