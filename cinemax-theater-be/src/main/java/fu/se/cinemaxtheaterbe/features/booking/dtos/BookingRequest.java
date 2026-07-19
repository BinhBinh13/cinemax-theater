package fu.se.cinemaxtheaterbe.features.booking.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class BookingRequest {

    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotEmpty(message = "At least one seat must be selected")
    private List<Long> seatIds = new ArrayList<>();

    private List<FoodItemRequest> foods = new ArrayList<>();

    @Getter
    @Setter
    public static class FoodItemRequest {
        @NotNull(message = "Food/Drink item ID is required")
        private Long foodDrinkId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}
