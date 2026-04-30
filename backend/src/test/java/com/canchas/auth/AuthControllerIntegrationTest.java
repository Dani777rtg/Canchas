package com.canchas.auth;

import com.canchas.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDb() {
        userRepository.deleteAll();
    }

    @Test
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
