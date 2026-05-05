package com.canchas.auth.service;

import com.canchas.auth.dto.AuthResponse;
import com.canchas.auth.dto.LoginRequest;
import com.canchas.auth.dto.RegisterRequest;
import com.canchas.auth.dto.UserResponse;
import com.canchas.auth.model.PasswordResetToken;
import com.canchas.auth.repository.PasswordResetTokenRepository;
import com.canchas.common.exception.ConflictException;
import com.canchas.common.exception.LockedException;
import com.canchas.common.exception.UnauthorizedException;
import com.canchas.common.exception.UnprocessableException;
import com.canchas.security.JwtService;
import com.canchas.user.model.User;
import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;
import com.canchas.user.repository.UserRepository;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final Environment environment;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            Environment environment
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.environment = environment;
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

    @Transactional
    public Map<String, String> forgotPassword(String email) {
        String normalized = email.trim().toLowerCase();
        String[] rawToken = {null};
        userRepository.findByEmail(normalized).ifPresent(user -> {
            String raw = UUID.randomUUID().toString();
            rawToken[0] = raw;
            PasswordResetToken row = new PasswordResetToken();
            row.setUser(user);
            row.setTokenHash(sha256Hex(raw));
            row.setExpiresAt(OffsetDateTime.now().plusHours(1));
            passwordResetTokenRepository.save(row);
        });
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", "Si el correo existe, enviaremos instrucciones para restablecer la clave.");
        if (rawToken[0] != null && environment.matchesProfiles("local")) {
            body.put("resetToken", rawToken[0]);
        }
        return body;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        String hash = sha256Hex(token);
        PasswordResetToken row = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new UnprocessableException("token invalido o vencido"));
        if (row.getUsedAt() != null) {
            throw new UnprocessableException("token ya utilizado");
        }
        if (row.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UnprocessableException("token vencido");
        }
        User u = row.getUser();
        u.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(u);
        row.setUsedAt(OffsetDateTime.now());
        passwordResetTokenRepository.save(row);
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
