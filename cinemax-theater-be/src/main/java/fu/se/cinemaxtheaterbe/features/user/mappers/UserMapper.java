package fu.se.cinemaxtheaterbe.features.user.mappers;

import fu.se.cinemaxtheaterbe.entity.user.Role;
import fu.se.cinemaxtheaterbe.entity.user.User;
import fu.se.cinemaxtheaterbe.features.user.dtos.UserRequest;
import fu.se.cinemaxtheaterbe.features.user.dtos.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);

    UserResponse.RoleDto toRoleDto(Role role);

    @Mapping(target = "roles", ignore = true)
    User toEntity(UserRequest request);

    @Mapping(target = "roles", ignore = true)
    void updateEntityFromRequest(UserRequest request, @MappingTarget User user);
}
