package com.canchas.admin;

import com.canchas.audit.repository.AuditLogRepository;
import com.canchas.court.model.Court;
import com.canchas.court.model.CourtStatus;
import com.canchas.court.repository.CourtRepository;
import com.canchas.reservation.model.Reservation;
import com.canchas.reservation.model.ReservationStatus;
import com.canchas.reservation.repository.ReservationRepository;
import com.canchas.user.model.User;
import com.canchas.user.model.UserRole;
import com.canchas.user.model.UserStatus;
import com.canchas.user.repository.UserRepository;
import com.canchas.venue.model.Venue;
import com.canchas.venue.repository.VenueRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReservationDeleteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private UUID reservationId;
    private String clientToken;
    private String adminToken;
    private UUID clientId;

    @BeforeEach
    void seedData() throws Exception {
        reservationRepository.deleteAll();
        auditLogRepository.deleteAll();
        courtRepository.deleteAll();
        venueRepository.deleteAll();
        userRepository.deleteAll();

        User admin = new User();
        admin.setEmail("admin@test.local");
        admin.setPasswordHash(passwordEncoder.encode("Admin123A"));
        admin.setFullName("Admin Test");
        admin.setRole(UserRole.ADMINISTRADOR);
        admin.setStatus(UserStatus.ACTIVO);
        admin.setFailedLoginCount(0);
        userRepository.save(admin);

        User client = new User();
        client.setEmail("cliente@test.local");
        client.setPasswordHash(passwordEncoder.encode("Admin123A"));
        client.setFullName("Cliente Test");
        client.setRole(UserRole.CLIENTE);
        client.setStatus(UserStatus.ACTIVO);
        client.setFailedLoginCount(0);
        client = userRepository.save(client);
        clientId = client.getId();

        Venue venue = new Venue();
        venue.setName("Medellin");
        venue = venueRepository.save(venue);

        Court court = new Court();
        court.setVenue(venue);
        court.setName("Cancha Test");
        court.setSportType("Fútbol");
        court.setStatus(CourtStatus.ACTIVA);
        court = courtRepository.save(court);

        Reservation reservation = new Reservation();
        reservation.setPublicCode("CY-TEST01");
        reservation.setCourt(court);
        reservation.setUser(client);
        reservation.setStartAt(Instant.now().plus(2, ChronoUnit.DAYS));
        reservation.setEndAt(Instant.now().plus(2, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS));
        reservation.setStatus(ReservationStatus.CONFIRMADA);
        reservation.setSubtotal(new BigDecimal("80000"));
        reservation.setTaxAmount(new BigDecimal("0"));
        reservation.setTotal(new BigDecimal("80000"));
        reservation = reservationRepository.save(reservation);
        reservationId = reservation.getId();

        clientToken = loginAndGetToken("cliente@test.local", "Admin123A");
        adminToken = loginAndGetToken("admin@test.local", "Admin123A");
    }

    @Test
    @DisplayName("DELETE /reservations/{id}: el cliente elimina su propia reserva")
    void clientShouldDeleteOwnReservation() throws Exception {
        mockMvc.perform(delete("/v1/reservations/" + reservationId)
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isNoContent());

        assertThat(reservationRepository.findById(reservationId)).isEmpty();
    }

    @Test
    @DisplayName("DELETE /admin/reservations/{id}: el admin elimina cualquier reserva")
    void adminShouldDeleteAnyReservation() throws Exception {
        mockMvc.perform(delete("/v1/admin/reservations/" + reservationId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        assertThat(reservationRepository.findById(reservationId)).isEmpty();
    }

    @Test
    @DisplayName("DELETE /reservations/{id}: otro cliente no puede eliminar la reserva ajena")
    void clientShouldNotDeleteForeignReservation() throws Exception {
        User other = new User();
        other.setEmail("otro@test.local");
        other.setPasswordHash(passwordEncoder.encode("Admin123A"));
        other.setFullName("Otro Cliente");
        other.setRole(UserRole.CLIENTE);
        other.setStatus(UserStatus.ACTIVO);
        other.setFailedLoginCount(0);
        userRepository.save(other);

        String otherToken = loginAndGetToken("otro@test.local", "Admin123A");

        mockMvc.perform(delete("/v1/reservations/" + reservationId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());

        assertThat(reservationRepository.findById(reservationId)).isPresent();
        assertThat(reservationRepository.findById(reservationId).orElseThrow().getUser().getId())
                .isEqualTo(clientId);
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
