package fu.se.cinemaxtheaterbe.features.user.services;

import fu.se.cinemaxtheaterbe.features.user.dtos.UserRequest;
import fu.se.cinemaxtheaterbe.features.user.dtos.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);

    List<UserResponse.RoleDto> getAllRoles();
}
