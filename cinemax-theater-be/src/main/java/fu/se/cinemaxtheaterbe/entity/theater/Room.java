package fu.se.cinemaxtheaterbe.entity.theater;

import fu.se.cinemaxtheaterbe.entity.Auditable;
import fu.se.cinemaxtheaterbe.entity.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * A screening room belonging to the {@link Theater}. Holds the seat layout and
 * the schedules played in it.
 */
@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /** Number of rows in the seat grid. */
    @Column(name = "row_count")
    private Integer rowCount;

    /** Number of columns in the seat grid. */
    @Column(name = "column_count")
    private Integer columnCount;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "theater_id", referencedColumnName = "theater_id")
    private Theater theater;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Seat> seats = new HashSet<>();

    @OneToMany(mappedBy = "room")
    @Builder.Default
    private Set<Schedule> schedules = new HashSet<>();
}
