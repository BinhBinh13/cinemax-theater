package fu.se.cinemaxtheaterbe.entity.theater;

import fu.se.cinemaxtheaterbe.entity.Auditable;
import fu.se.cinemaxtheaterbe.entity.enums.ItemTheaterStock;
import fu.se.cinemaxtheaterbe.entity.enums.TheaterStockStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Inventory item (food / drink) sold at the {@link Theater}.
 */
@Entity
@Table(name = "theater_stocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheaterStock extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "theater_stock_id")
    private Long id;

    @Column(name = "item_name", nullable = false, columnDefinition = "NVARCHAR(150)")
    private String itemName;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock;

    @Column(name = "imgURL", nullable = false)
    private String imageURL;

    @Enumerated(EnumType.STRING)
    private TheaterStockStatus status;

    @Enumerated(EnumType.STRING)
    private ItemTheaterStock itemType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "theater_id", referencedColumnName = "theater_id")
    private Theater theater;
}
