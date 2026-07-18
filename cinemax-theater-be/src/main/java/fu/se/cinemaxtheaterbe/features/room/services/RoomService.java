package fu.se.cinemaxtheaterbe.features.room.services;

import fu.se.cinemaxtheaterbe.features.room.dtos.RoomDetailResponse;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomRequest;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomResponse;

import java.util.List;

public interface RoomService {

    List<RoomResponse> getAllRooms();

    RoomResponse getRoomById(Long id);

    RoomDetailResponse getRoomDetail(Long id);

    RoomResponse createRoom(RoomRequest request);

    RoomResponse updateRoom(Long id, RoomRequest request);

    void deleteRoom(Long id);

    void updateSeatType(Long seatId, String seatType);

    void updateSeatStatus(Long seatId, String status);
}
