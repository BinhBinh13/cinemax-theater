package fu.se.cinemaxtheaterbe.features.room.controllers;

import fu.se.cinemaxtheaterbe.features.room.dtos.RoomDetailResponse;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomRequest;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomResponse;
import fu.se.cinemaxtheaterbe.features.room.services.RoomService;
import fu.se.cinemaxtheaterbe.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(ApiPath.ROOMS)
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<RoomDetailResponse> getRoomDetail(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomDetail(id));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id,
                                                    @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/seats/{seatId}/type")
    public ResponseEntity<Void> updateSeatType(@PathVariable Long seatId,
                                                @RequestBody Map<String, String> body) {
        roomService.updateSeatType(seatId, body.get("seatType"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/seats/{seatId}/status")
    public ResponseEntity<Void> updateSeatStatus(@PathVariable Long seatId,
                                                  @RequestBody Map<String, String> body) {
        roomService.updateSeatStatus(seatId, body.get("status"));
        return ResponseEntity.ok().build();
    }
}
