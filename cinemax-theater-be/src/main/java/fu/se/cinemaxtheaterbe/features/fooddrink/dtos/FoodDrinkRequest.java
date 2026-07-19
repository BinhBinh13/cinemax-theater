package fu.se.cinemaxtheaterbe.features.fooddrink.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.ItemTheaterStock;
import fu.se.cinemaxtheaterbe.entity.enums.TheaterStockStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class FoodDrinkRequest {

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "1000", message = "Price must be at least 1000 VND")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantityInStock;

    @NotBlank(message = "Image is required")
    private String imageURL;

    @NotNull(message = "Item type is required")
    private ItemTheaterStock itemType;

    @NotNull(message = "Status is required")
    private TheaterStockStatus status;
}
