package com.canchas.auth.service;

import com.canchas.auth.dto.LoginRequest;
import com.canchas.auth.dto.RegisterRequest;
import com.canchas.common.exception.ConflictException;
import com.canchas.common.exception.LockedException;
import com.canchas.common.exception.UnauthorizedException;
import com.canchas.security.JwtService;
import com.canchas.user.model.User;
import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;
import com.canchas.user.repository.UserRepository;
import com.canchas.auth.repository.PasswordResetTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("AuthService: registro e inicio de sesión (lógica de negocio, sin base de datos real)")
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private Environment environment;

    private AuthService authService;

    private final UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                passwordResetTokenRepository,
                environment
        );
    }

    @Test
    @DisplayName("Registro: si el correo ya existe, se rechaza con error de conflicto y no se guarda ningún usuario.")
    void register_throwsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("dup@mail.com")).thenReturn(true);
        RegisterRequest req = new RegisterRequest("Dup@Mail.Com", "Clave123A", "Nombre", "300");

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("correo ya registrado");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Registro exitoso: normaliza correo y nombre, guarda cliente activo, codifica la contraseña y devuelve token JWT.")
    void register_savesClienteAndReturnsToken() {
        when(userRepository.existsByEmail("new@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("Clave123A")).thenReturn("encoded-hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assignUserId(u, userId);
            return u;
        });
        when(jwtService.generateToken(eq(userId), eq("new@mail.com"), eq("CLIENTE"))).thenReturn("jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(900L);

        RegisterRequest req = new RegisterRequest("  New@Mail.COM  ", "Clave123A", "  Juan  ", "3001112233");
        var response = authService.register(req);

        assertThat(response.accessToken()).isEqualTo("jwt");
        assertThat(response.user().email()).isEqualTo("new@mail.com");
        assertThat(response.user().role()).isEqualTo(UserRole.CLIENTE);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("new@mail.com");
        assertThat(saved.getFullName()).isEqualTo("Juan");
        assertThat(saved.getPasswordHash()).isEqualTo("encoded-hash");
        assertThat(saved.getStatus()).isEqualTo(UserStatus.ACTIVO);
    }

    @Test
    @DisplayName("Login: si no hay usuario con ese correo, se responde como credenciales inválidas (sin filtrar si existía o no).")
    void login_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("A@B.Com", "x")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("credenciales invalidas");
    }

    @Test
    @DisplayName("Login: usuario inactivo no puede entrar aunque la contraseña sea correcta.")
    void login_throwsWhenUserInactive() {
        User user = baseUser();
        user.setStatus(UserStatus.INACTIVO);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("a@b.com", "Clave123A")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("usuario inactivo");
    }

    @Test
    @DisplayName("Login: cuenta temporalmente bloqueada no acepta intentos hasta pasar el tiempo de bloqueo.")
    void login_throwsLockedWhenStillLocked() {
        User user = baseUser();
        user.setLockedUntil(OffsetDateTime.now().plusMinutes(10));
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("a@b.com", "Clave123A")))
                .isInstanceOf(LockedException.class)
                .hasMessageContaining("bloqueada");
    }

    @Test
    @DisplayName("Login: contraseña incorrecta incrementa el contador de intentos fallidos y persiste el usuario.")
    void login_wrongPassword_incrementsFailedCount() {
        User user = baseUser();
        user.setFailedLoginCount(0);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("a@b.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getFailedLoginCount()).isEqualTo(1);
        assertThat(captor.getValue().getLockedUntil()).isNull();
    }

    @Test
    @DisplayName("Login: al quinto intento fallido seguido, la cuenta se bloquea por un periodo y el contador de intentos se reinicia.")
    void login_fifthWrongAttempt_setsLockAndResetsCounter() {
        User user = baseUser();
        user.setFailedLoginCount(4);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("a@b.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getFailedLoginCount()).isZero();
        assertThat(captor.getValue().getLockedUntil()).isNotNull();
    }

    @Test
    @DisplayName("Login exitoso: limpia bloqueo e intentos fallidos, guarda el usuario y devuelve token JWT.")
    void login_success_clearsLockAndReturnsToken() {
        User user = baseUser();
        user.setFailedLoginCount(2);
        user.setLockedUntil(null);
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Clave123A", "hash")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(eq(userId), eq("a@b.com"), eq("CLIENTE"))).thenReturn("jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(900L);

        var response = authService.login(new LoginRequest("a@b.com", "Clave123A"));

        assertThat(response.accessToken()).isEqualTo("jwt");
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getFailedLoginCount()).isZero();
        assertThat(captor.getValue().getLockedUntil()).isNull();
    }

    private User baseUser() {
        User user = new User();
        assignUserId(user, userId);
        user.setEmail("a@b.com");
        user.setPasswordHash("hash");
        user.setFullName("Test");
        user.setRole(UserRole.CLIENTE);
        user.setStatus(UserStatus.ACTIVO);
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        return user;
    }

    private static void assignUserId(User user, UUID id) {
        try {
            Field f = User.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(user, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
    }
}
