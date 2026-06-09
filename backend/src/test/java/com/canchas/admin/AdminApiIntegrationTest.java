package com.canchas.admin;

import com.canchas.user.model.User;
import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;
import com.canchas.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void seedAdmin() {
        userRepository.deleteAll();
        User admin = new User();
        admin.setEmail("admin@test.local");
        admin.setPasswordHash(passwordEncoder.encode("Admin123A"));
        admin.setFullName("Admin Test");
        admin.setRole(UserRole.ADMINISTRADOR);
        admin.setStatus(UserStatus.ACTIVO);
        admin.setFailedLoginCount(0);
        userRepository.save(admin);
    }

    @Test
    @DisplayName("GET /admin/users: lista paginada sin filtro de correo responde 200")
    void listUsersWithoutEmailFilterShouldSucceed() throws Exception {
        String token = loginAndGetToken("admin@test.local", "Admin123A");

        mockMvc.perform(get("/v1/admin/users?page=1&limit=15")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value("admin@test.local"));
    }

    @Test
    @DisplayName("GET /admin/reservations: rango de fechas responde 200")
    void listAdminReservationsShouldSucceed() throws Exception {
        String token = loginAndGetToken("admin@test.local", "Admin123A");

        mockMvc.perform(get("/v1/admin/reservations?from=2026-06-01&to=2026-06-30&page=1&limit=15")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        String payload = """
                {"email":"%s","password":"%s"}
                """.formatted(email, password);

        return mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString()
                .replaceAll("(?s).*\"accessToken\"\\s*:\\s*\"([^\"]+)\".*", "$1");
    }
}
