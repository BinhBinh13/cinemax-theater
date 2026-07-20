package fu.se.cinemaxtheaterbe.features.room.services;

import fu.se.cinemaxtheaterbe.entity.enums.RoomStatus;
import fu.se.cinemaxtheaterbe.entity.enums.SeatStatus;
import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import fu.se.cinemaxtheaterbe.entity.theater.Room;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.entity.theater.Theater;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomDetailResponse;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomRequest;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomResponse;
import fu.se.cinemaxtheaterbe.features.room.mappers.RoomMapper;
import fu.se.cinemaxtheaterbe.features.room.repositories.RoomRepository;
import fu.se.cinemaxtheaterbe.features.room.repositories.SeatRepository;
import fu.se.cinemaxtheaterbe.features.theater.repositories.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final TheaterRepository theaterRepository;
    private final RoomMapper roomMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAllActive().stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        return roomMapper.toResponse(findRoomOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomDetail(Long id) {
        Room room = roomRepository.findByIdActive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));
        return roomMapper.toDetailResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        validateNameUnique(request.getName(), null);
        Theater theater = findTheaterOrThrow();

        Room room = roomMapper.toEntity(request);
        room.setStatus(request.getStatus() != null ? request.getStatus() : RoomStatus.ACTIVE);
        room.setTheater(theater);

        if (request.getRowCount() != null && request.getColumnCount() != null) {
            room.setSeats(generateSeats(room, request.getRowCount(), request.getColumnCount()));
        }

        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = findRoomOrThrow(id);
        validateNameUnique(request.getName(), id);

        roomMapper.updateEntity(room, request);

        if (request.getRowCount() != null) room.setRowCount(request.getRowCount());
        if (request.getColumnCount() != null) room.setColumnCount(request.getColumnCount());
        if (request.getStatus() != null) room.setStatus(request.getStatus());

        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        Room room = findRoomOrThrow(id);
        room.setDeleted(true);
        room.setDeletedAt(LocalDateTime.now());
        roomRepository.save(room);
    }

    @Override
    @Transactional
    public void updateSeatType(Long seatId, String seatType) {
        Seat seat = seatRepository.findByIdAndDeletedFalse(seatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seat not found: " + seatId));
        try {
            seat.setSeatType(SeatType.valueOf(seatType));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seat type: " + seatType);
        }
        seatRepository.save(seat);
    }

    @Override
    @Transactional
    public void updateSeatStatus(Long seatId, String status) {
        Seat seat = seatRepository.findByIdAndDeletedFalse(seatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seat not found: " + seatId));
        try {
            seat.setStatus(SeatStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seat status: " + status);
        }
        seatRepository.save(seat);
    }

    private void validateNameUnique(String name, Long excludeId) {
        boolean exists = excludeId == null
                ? roomRepository.existsByNameIgnoreCaseAndDeletedFalse(name)
                : roomRepository.existsByNameIgnoreCaseAndDeletedFalseAndIdNot(name, excludeId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A room with this name already exists");
        }
    }

    private Theater findTheaterOrThrow() {
        return theaterRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "No theater configured"));
    }

    private Room findRoomOrThrow(Long id) {
        return roomRepository.findByIdActive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));
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
