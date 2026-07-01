package fu.se.cinemaxtheaterbe.entity.theater;

import fu.se.cinemaxtheaterbe.entity.Auditable;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * The cinema location. This system runs a single theater, so it is never
 * created/updated/deleted through CRUD — the row is seeded once and simply
 * referenced by rooms and stock.
 */
@Entity
@Table(name = "theaters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Theater extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "theater_id")
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "hotline", length = 20)
    private String hotline;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @OneToMany(mappedBy = "theater")
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();

    @OneToMany(mappedBy = "theater")
    @Builder.Default
    private Set<TheaterStock> stocks = new HashSet<>();
}
