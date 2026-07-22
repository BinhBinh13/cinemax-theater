package fu.se.cinemaxtheaterbe.features.auth.services;

import fu.se.cinemaxtheaterbe.entity.user.Role;
import fu.se.cinemaxtheaterbe.entity.user.User;
import fu.se.cinemaxtheaterbe.entity.enums.UserStatus;
import fu.se.cinemaxtheaterbe.features.auth.dtos.AuthResponse;
import fu.se.cinemaxtheaterbe.features.auth.dtos.LoginRequest;
import fu.se.cinemaxtheaterbe.features.auth.dtos.RegisterRequest;
import fu.se.cinemaxtheaterbe.features.auth.dtos.ProfileUpdateRequest;
import fu.se.cinemaxtheaterbe.features.auth.dtos.UserResponse;
import fu.se.cinemaxtheaterbe.features.auth.repositories.RoleRepository;
import fu.se.cinemaxtheaterbe.features.auth.repositories.UserRepository;
import fu.se.cinemaxtheaterbe.features.auth.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(jwt);
        authResponse.setTokenType("Bearer");
        authResponse.setUsername(user.getUsername());
        authResponse.setEmail(user.getEmail());
        authResponse.setFullName(user.getFullName());
        authResponse.setRoles(roles);

        return authResponse;
    }

    @Override
    @Transactional
    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        // Create new user account
        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .phone(registerRequest.getPhone())
                .status(UserStatus.Active) // Active by default
                .build();

        // Assign default CUSTOMER role
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name("CUSTOMER")
                            .description("Default role for movie customers")
                            .build();
                    return roleRepository.save(role);
                });

        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);
        user.setRoles(roles);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String username, ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email đã được đăng ký bởi tài khoản khác!");
            }
            user.setEmail(request.getEmail());
        }

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);

        List<String> roleNames = updatedUser.getRoles().stream()
                .map(role -> {
                    String name = role.getName();
                    return name.startsWith("ROLE_") ? name : "ROLE_" + name;
                })
                .collect(Collectors.toList());

        return UserResponse.builder()
                .username(updatedUser.getUsername())
                .email(updatedUser.getEmail())
                .fullName(updatedUser.getFullName())
                .phone(updatedUser.getPhone())
                .roles(roleNames)
                .build();
    }
}
