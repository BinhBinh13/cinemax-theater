package fu.se.cinemaxtheaterbe.features.auth.controllers;

import fu.se.cinemaxtheaterbe.entity.user.Role;
import fu.se.cinemaxtheaterbe.entity.user.User;
import fu.se.cinemaxtheaterbe.features.auth.dtos.ProfileUpdateRequest;
import fu.se.cinemaxtheaterbe.features.auth.dtos.UserResponse;
import fu.se.cinemaxtheaterbe.features.auth.repositories.UserRepository;
import fu.se.cinemaxtheaterbe.features.auth.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        UserResponse response = UserResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .roles(roleNames)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String username = principal.getName();
        return ResponseEntity.ok(authService.updateProfile(username, request));
    }
}
