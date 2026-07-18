package fu.se.cinemaxtheaterbe.config;

import fu.se.cinemaxtheaterbe.entity.enums.SeatStatus;
import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import fu.se.cinemaxtheaterbe.entity.theater.Room;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.features.room.repositories.RoomRepository;
import fu.se.cinemaxtheaterbe.features.room.repositories.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class SeatMigrationRunner implements CommandLineRunner {

    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;

    @Override
    public void run(String... args) {
        List<Room> rooms = roomRepository.findAll();
        int migrated = 0;
        for (Room room : rooms) {
            if (room.isDeleted()) continue;
            long existingCount = seatRepository.findByRoomId(room.getId()).size();
            if (existingCount == 0 && room.getRowCount() != null && room.getColumnCount() != null) {
                Set<Seat> seats = generateSeats(room, room.getRowCount(), room.getColumnCount());
                seatRepository.saveAll(seats);
                migrated++;
                log.info("Generated {} seats for room '{}'", seats.size(), room.getName());
            }
        }
        if (migrated > 0) {
            log.info("Seat migration completed for {} rooms.", migrated);
        } else {
            log.info("All rooms already have seats, nothing to migrate.");
        }
    }

    private Set<Seat> generateSeats(Room room, int rows, int cols) {
        Set<Seat> seats = new HashSet<>();
        for (int r = 0; r < rows; r++) {
            String rowLabel = String.valueOf((char) ('A' + r));
            for (int c = 1; c <= cols; c++) {
                Seat seat = Seat.builder()
                        .seatRow(rowLabel)
                        .seatColumn(c)
                        .seatType(SeatType.NORMAL)
                        .status(SeatStatus.ACTIVE)
                        .room(room)
                        .build();
                seats.add(seat);
            }
        }
        return seats;
    }
}
