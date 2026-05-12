package com.canchas.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService: firma y lectura de tokens JWT")
class JwtServiceTest {

    private static final String SECRET_32 = "0123456789abcdef0123456789abcdef";

    @Test
    @DisplayName("Seguridad: si el secreto JWT tiene menos de 32 bytes, el servicio no se construye (evita claves débiles).")
    void constructor_rejectsSecretShorterThan32Bytes() {
        assertThatThrownBy(() -> new JwtService("short-secret-under-32-chars", 60))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("JWT secret");
    }

    @Test
    @DisplayName("Flujo completo: generar un token y leer de vuelta usuario, correo, rol y duración de expiración en segundos.")
    void generateToken_roundTripClaims() {
        JwtService jwt = new JwtService(SECRET_32, 60);
        var userId = java.util.UUID.fromString("22222222-2222-2222-2222-222222222222");

        String token = jwt.generateToken(userId, "u@mail.com", "CLIENTE");
        Claims claims = jwt.extractClaims(token);

        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.get("email", String.class)).isEqualTo("u@mail.com");
        assertThat(claims.get("role", String.class)).isEqualTo("CLIENTE");
        assertThat(jwt.getExpirationSeconds()).isEqualTo(3600L);
    }
}
