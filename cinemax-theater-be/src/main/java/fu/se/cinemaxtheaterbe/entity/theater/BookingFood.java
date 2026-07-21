package fu.se.cinemaxtheaterbe.entity.theater;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "booking_foods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingFood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_food_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", referencedColumnName = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "theater_stock_id", referencedColumnName = "theater_stock_id")
    private TheaterStock foodDrink;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price; // Price of food item at the time of booking
}
