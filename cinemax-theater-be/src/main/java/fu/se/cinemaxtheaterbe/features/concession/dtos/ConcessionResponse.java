package fu.se.cinemaxtheaterbe.features.concession.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcessionResponse {
    private Long id;
    private String itemName;
    private String type;
    private Double price;
    private String description;
    private String imageUrl;
    private String status;
}
