package com.canchas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@DisplayName("Aplicación Spring Boot (arranque completo con perfil test)")
@SpringBootTest
@ActiveProfiles("test")
class CanchasApplicationTests {

    @Test
    @DisplayName("El contexto de Spring carga sin errores (beans, configuración y perfil test).")
    void contextLoads() {
    }
}
