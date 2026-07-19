package fu.se.cinemaxtheaterbe.entity.theater;

import fu.se.cinemaxtheaterbe.entity.Auditable;
import fu.se.cinemaxtheaterbe.entity.enums.SeatStatus;
import fu.se.cinemaxtheaterbe.entity.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;

/**
 * A single seat inside a {@link Room}, identified by its row letter and column
 * number within the room's grid.
 */
@Entity
@Table(name = "seats",
        uniqueConstraints = @UniqueConstraint(name = "uk_seat_room_position",
                columnNames = {"room_id", "seat_row", "seat_column"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long id;

    /** Row label, e.g. "A", "B". */
    @Column(name = "seat_row", nullable = false, length = 5)
    private String seatRow;

    /** Column index within the row. */
    @Column(name = "seat_column", nullable = false)
    private Integer seatColumn;

    /** NORMAL / VIP / COUPLE. */
    @Enumerated(EnumType.STRING)
    private SeatType seatType;

    /** AVAILABLE / DISABLED. */
    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", referencedColumnName = "room_id")
    private Room room;
}
