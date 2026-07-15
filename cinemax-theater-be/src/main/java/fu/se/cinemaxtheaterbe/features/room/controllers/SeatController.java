package fu.se.cinemaxtheaterbe.features.room.controllers;

import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.features.room.dtos.SeatResponse;
import fu.se.cinemaxtheaterbe.features.room.repositories.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class SeatController {

    private final SeatRepository seatRepository;

    @GetMapping("/{roomId}/seats")
    public ResponseEntity<List<SeatResponse>> getRoomSeats(@PathVariable Long roomId) {
        List<Seat> seats = seatRepository.findByRoomId(roomId);
        List<SeatResponse> response = seats.stream()
                .map(seat -> SeatResponse.builder()
                        .id(seat.getId())
                        .seatRow(seat.getSeatRow())
                        .seatColumn(seat.getSeatColumn())
                        .seatType(seat.getSeatType())
                        .status(seat.getStatus())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
