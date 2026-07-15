package fu.se.cinemaxtheaterbe.features.auth.services;

import fu.se.cinemaxtheaterbe.features.auth.dtos.AuthResponse;
import fu.se.cinemaxtheaterbe.features.auth.dtos.LoginRequest;
import fu.se.cinemaxtheaterbe.features.auth.dtos.RegisterRequest;
import fu.se.cinemaxtheaterbe.features.auth.dtos.ProfileUpdateRequest;
import fu.se.cinemaxtheaterbe.features.auth.dtos.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    void register(RegisterRequest registerRequest);
    UserResponse updateProfile(String username, ProfileUpdateRequest request);
}
