package fu.se.cinemaxtheaterbe.features.user.dtos;

import fu.se.cinemaxtheaterbe.entity.enums.UserStatus;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private UserStatus status;
    private Set<RoleDto> roles;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleDto {
        private Long id;
        private String name;
        private String description;
    }
}
