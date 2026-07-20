package fu.se.cinemaxtheaterbe.features.auth.dtos;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private List<String> roles;
}
