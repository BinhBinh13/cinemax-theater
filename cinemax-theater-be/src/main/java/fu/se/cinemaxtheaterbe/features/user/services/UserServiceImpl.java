package fu.se.cinemaxtheaterbe.features.user.services;

import fu.se.cinemaxtheaterbe.entity.Role;
import fu.se.cinemaxtheaterbe.entity.User;
import fu.se.cinemaxtheaterbe.entity.enums.UserStatus;
import fu.se.cinemaxtheaterbe.features.user.dtos.UserRequest;
import fu.se.cinemaxtheaterbe.features.user.dtos.UserResponse;
import fu.se.cinemaxtheaterbe.features.user.mappers.UserMapper;
import fu.se.cinemaxtheaterbe.features.auth.repositories.RoleRepository;
import fu.se.cinemaxtheaterbe.features.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }

    @Override
    public UserResponse createUser(UserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists: " + request.getUsername());
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists: " + request.getEmail());
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        if (request.getStatus() == null) {
            user.setStatus(UserStatus.Active);
        } else {
            user.setStatus(request.getStatus());
        }

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            List<Role> roles = roleRepository.findAllById(request.getRoleIds());
            user.setRoles(new HashSet<>(roles));
        }

        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        userRepository.findByUsername(request.getUsername()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists: " + request.getUsername());
            }
        });

        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists: " + request.getEmail());
            }
        });

        userMapper.updateEntityFromRequest(request, user);

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoleIds() != null) {
            List<Role> roles = roleRepository.findAllById(request.getRoleIds());
            user.setRoles(new HashSet<>(roles));
        }

        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        user.setStatus(UserStatus.Inactive);
        userRepository.save(user);
    }

    @Override
    public List<UserResponse.RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(userMapper::toRoleDto)
                .toList();
    }
}
