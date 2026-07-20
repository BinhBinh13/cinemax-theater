package fu.se.cinemaxtheaterbe.features.room.mappers;

import fu.se.cinemaxtheaterbe.entity.theater.Room;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomDetailResponse;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomRequest;
import fu.se.cinemaxtheaterbe.features.room.dtos.RoomResponse;
import fu.se.cinemaxtheaterbe.features.room.dtos.SeatResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    @Mapping(target = "theaterId", source = "theater.id")
    @Mapping(target = "theaterName", source = "theater.name")
    @Mapping(target = "seatCount", expression = "java(room.getRowCount() != null && room.getColumnCount() != null ? room.getRowCount() * room.getColumnCount() : 0)")
    RoomResponse toResponse(Room room);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "theater", ignore = true)
    @Mapping(target = "seats", ignore = true)
    @Mapping(target = "schedules", ignore = true)
    Room toEntity(RoomRequest request);

    @Mapping(target = "theater", ignore = true)
    @Mapping(target = "seats", ignore = true)
    @Mapping(target = "schedules", ignore = true)
    void updateEntity(@MappingTarget Room room, RoomRequest request);

    @Mapping(target = "theaterId", source = "theater.id")
    @Mapping(target = "theaterName", source = "theater.name")
    @Mapping(target = "seatCount", expression = "java(room.getRowCount() != null && room.getColumnCount() != null ? room.getRowCount() * room.getColumnCount() : 0)")
    @Mapping(target = "seats", expression = "java(toSeatResponses(room.getSeats()))")
    RoomDetailResponse toDetailResponse(Room room);

    default SeatResponse toSeatResponse(Seat seat) {
        if (seat == null) return null;
        return SeatResponse.builder()
                .id(seat.getId())
                .seatRow(seat.getSeatRow())
                .seatColumn(seat.getSeatColumn())
                .seatType(seat.getSeatType())
                .status(seat.getStatus())
                .build();
    }

    default java.util.List<SeatResponse> toSeatResponses(java.util.Set<Seat> seats) {
        if (seats == null) return java.util.Collections.emptyList();
        return seats.stream()
                .map(this::toSeatResponse)
                .sorted((a, b) -> {
                    int rowCmp = a.getSeatRow().compareTo(b.getSeatRow());
                    if (rowCmp != 0) return rowCmp;
                    return a.getSeatColumn().compareTo(b.getSeatColumn());
                })
                .toList();
    }
}
