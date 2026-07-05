package fu.se.cinemaxtheaterbe.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "concession_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcessionItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "concession_item_id")
    private Long id;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // FOOD, BEVERAGE, COMBO

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE
}
