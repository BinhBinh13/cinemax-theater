package fu.se.cinemaxtheaterbe.features.user.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.UserStatus;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private String username;
    private String email;
    private String password; // Raw password (hash on backend)
    private String fullName;
    private String phone;
    private UserStatus status;
    private Set<Long> roleIds;
}
