package fu.se.cinemaxtheaterbe.features.fooddrink.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.ItemTheaterStock;
import fu.se.cinemaxtheaterbe.entity.enums.TheaterStockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodDrinkResponse {

    private Long id;
    private String itemName;
    private BigDecimal price;
    private Integer quantityInStock;
    private String imageURL;
    private ItemTheaterStock itemType;
    private TheaterStockStatus status;
}
