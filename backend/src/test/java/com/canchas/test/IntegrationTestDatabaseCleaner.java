package com.canchas.test;

import com.canchas.audit.repository.AuditLogRepository;
import com.canchas.auth.repository.PasswordResetTokenRepository;
import com.canchas.court.repository.CourtRepository;
import com.canchas.payment.repository.PaymentRepository;
import com.canchas.reservation.repository.ReservationIdempotencyRepository;
import com.canchas.reservation.repository.ReservationRepository;
import com.canchas.user.repository.UserRepository;
import com.canchas.venue.repository.VenueRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Limpia tablas en orden seguro para tests de integración que comparten H2 en memoria.
 */
@Component
public class IntegrationTestDatabaseCleaner {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationIdempotencyRepository idempotencyRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final CourtRepository courtRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    public IntegrationTestDatabaseCleaner(
            PaymentRepository paymentRepository,
            ReservationRepository reservationRepository,
            ReservationIdempotencyRepository idempotencyRepository,
            AuditLogRepository auditLogRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            CourtRepository courtRepository,
            VenueRepository venueRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.reservationRepository = reservationRepository;
        this.idempotencyRepository = idempotencyRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.courtRepository = courtRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void resetAll() {
        paymentRepository.deleteAll();
        reservationRepository.deleteAll();
        idempotencyRepository.deleteAll();
        auditLogRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        courtRepository.deleteAll();
        venueRepository.deleteAll();
        userRepository.deleteAll();
    }
}
