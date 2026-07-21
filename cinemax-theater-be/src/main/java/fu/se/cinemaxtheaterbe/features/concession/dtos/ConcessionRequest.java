package fu.se.cinemaxtheaterbe.features.concession.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcessionRequest {
    private String itemName;
    private String type; // FOOD, BEVERAGE, COMBO
    private Double price;
    private String description;
    private String imageUrl;
    private String status;
}
