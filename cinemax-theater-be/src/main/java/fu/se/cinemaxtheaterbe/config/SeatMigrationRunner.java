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
        int updated = 0;
        for (Room room : rooms) {
            if (room.isDeleted()) continue;
            Set<Seat> existingSeats = seatRepository.findByRoomId(room.getId());
            if (existingSeats.isEmpty() && room.getRowCount() != null && room.getColumnCount() != null) {
                Set<Seat> seats = generateSeats(room, room.getRowCount(), room.getColumnCount());
                seatRepository.saveAll(seats);
                migrated++;
                log.info("Generated {} seats with VIP/Couple styles for room '{}'", seats.size(), room.getName());
            } else if (!existingSeats.isEmpty() && room.getRowCount() != null) {
                // Retroactively update seat types if the room has only NORMAL seats
                boolean hasSpecialSeats = existingSeats.stream().anyMatch(s -> s.getSeatType() != SeatType.NORMAL);
                if (!hasSpecialSeats) {
                    int rows = room.getRowCount();
                    for (Seat seat : existingSeats) {
                        int r = seat.getSeatRow().charAt(0) - 'A';
                        if (r == rows - 1) {
                            seat.setSeatType(SeatType.COUPLE);
                        } else if (rows >= 4 && (r == 2 || r == 3)) {
                            seat.setSeatType(SeatType.VIP);
                        }
                    }
                    seatRepository.saveAll(existingSeats);
                    updated++;
                    log.info("Updated seat types retroactively (VIP/Couple) for existing seats in room '{}'", room.getName());
                }
            }
        }
        if (migrated > 0 || updated > 0) {
            log.info("Seat migration and updates completed ({} migrated, {} updated).", migrated, updated);
        } else {
            log.info("All rooms already have configured seat layouts.");
        }
    }

    private Set<Seat> generateSeats(Room room, int rows, int cols) {
        Set<Seat> seats = new HashSet<>();
        for (int r = 0; r < rows; r++) {
            String rowLabel = String.valueOf((char) ('A' + r));
            for (int c = 1; c <= cols; c++) {
                SeatType seatType = SeatType.NORMAL;
                if (r == rows - 1) {
                    seatType = SeatType.COUPLE;
                } else if (rows >= 4 && (r == 2 || r == 3)) {
                    seatType = SeatType.VIP;
                }
                Seat seat = Seat.builder()
                        .seatRow(rowLabel)
                        .seatColumn(c)
                        .seatType(seatType)
                        .status(SeatStatus.ACTIVE)
                        .room(room)
                        .build();
                seats.add(seat);
            }
        }
        return seats;
    }
}
