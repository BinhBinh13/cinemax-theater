package fu.se.cinemaxtheaterbe.features.booking.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private String txnRef;
    private String movieTitle;
    private String roomName;
    private String showtime;
    private String fullName;
    private String email;
    private String phone;
    private List<String> seatCodes;
    private List<FoodItemResponse> foods;
    private BigDecimal totalAmount;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String payDate;
    private LocalDateTime bookingDate;
    private String paymentUrl;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodItemResponse {
        private String itemName;
        private Integer quantity;
        private BigDecimal price;
    }
}
