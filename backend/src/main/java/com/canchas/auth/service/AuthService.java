package com.canchas.auth.service;

import com.canchas.auth.dto.AuthResponse;
import com.canchas.auth.dto.LoginRequest;
import com.canchas.auth.dto.RegisterRequest;
import com.canchas.auth.dto.UserResponse;
import com.canchas.common.exception.ConflictException;
import com.canchas.common.exception.LockedException;
import com.canchas.common.exception.UnauthorizedException;
import com.canchas.security.JwtService;
import com.canchas.user.model.User;
import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;
import com.canchas.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("correo ya registrado");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone());
        user.setRole(UserRole.CLIENTE);
        user.setStatus(UserStatus.ACTIVO);
        user.setFailedLoginCount(0);

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("credenciales invalidas"));

        if (user.getStatus() == UserStatus.INACTIVO) {
            throw new UnauthorizedException("usuario inactivo");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new LockedException("cuenta bloqueada temporalmente. Intenta mas tarde");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            int nextAttempts = user.getFailedLoginCount() + 1;
            user.setFailedLoginCount(nextAttempts);
            if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.setLockedUntil(now.plusMinutes(LOCK_MINUTES));
                user.setFailedLoginCount(0);
            }
            userRepository.save(user);
            throw new UnauthorizedException("credenciales invalidas");
        }

        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.getStatus()
        );

        return new AuthResponse(token, "Bearer", jwtService.getExpirationSeconds(), userResponse);
    }
}
