package com.canchas.auth;

import com.canchas.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("API de autenticación (integración: Spring + MockMvc + H2)")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDb() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Semilla Flyway: la contraseña de admin en migración coincide con el encoder BCrypt de Spring.")
    void seedAdminPasswordFromFlywayShouldMatchSpringBcrypt() {
        String flywaySeedHash = "$2b$10$4gBf5KefZmIw9PNnCz5a5OqjC51yOmaQnpqGhZDIbxCNQTKNFe9MK";
        Assertions.assertTrue(passwordEncoder.matches("Admin123A", flywaySeedHash));
    }

    @Test
    @DisplayName("HTTP POST /register: crea usuario cliente y responde 201 con JWT y datos del usuario.")
    void registerShouldCreateUserAndReturnToken() throws Exception {
        String payload = """
                {
                  "email": "cliente@demo.com",
                  "password": "Clave123A",
                  "fullName": "Cliente Demo",
                  "phone": "3000000000"
                }
                """;

        mockMvc.perform(post("/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("cliente@demo.com"))
                .andExpect(jsonPath("$.user.role").value("CLIENTE"));
    }

    @Test
    @DisplayName("HTTP POST /register: rechaza telefono con letras o formato invalido.")
    void registerShouldRejectInvalidPhone() throws Exception {
        String payload = """
                {
                  "email": "cliente@demo.com",
                  "password": "Clave123A",
                  "fullName": "Cliente Demo",
                  "phone": "300abc1234"
                }
                """;

        mockMvc.perform(post("/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("HTTP POST /register: rechaza correo con formato invalido.")
    void registerShouldRejectInvalidEmail() throws Exception {
        String payload = """
                {
                  "email": "correo-sin-formato",
                  "password": "Clave123A",
                  "fullName": "Cliente Demo"
                }
                """;

        mockMvc.perform(post("/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("HTTP POST /login: con contraseña incorrecta responde 401 y código de error esperado.")
    void loginShouldFailWhenPasswordIsInvalid() throws Exception {
        String registerPayload = """
                {
                  "email": "cliente@demo.com",
                  "password": "Clave123A",
                  "fullName": "Cliente Demo",
                  "phone": "3000000000"
                }
                """;

        mockMvc.perform(post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerPayload));

        String loginPayload = """
                {
                  "email": "cliente@demo.com",
                  "password": "wrongpass"
                }
                """;

        mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }
}
