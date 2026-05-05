package com.canchas.admin.payment.service;

import com.canchas.admin.payment.dto.ManualPaymentRequest;
import com.canchas.audit.service.AuditService;
import com.canchas.common.exception.NotFoundException;
import com.canchas.common.exception.UnprocessableException;
import com.canchas.payment.model.Payment;
import com.canchas.payment.model.PaymentMethod;
import com.canchas.payment.model.PaymentStatus;
import com.canchas.payment.repository.PaymentRepository;
import com.canchas.reservation.model.Reservation;
import com.canchas.reservation.repository.ReservationRepository;
import com.canchas.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AdminPaymentService {

    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;

    public AdminPaymentService(
            ReservationRepository reservationRepository,
            PaymentRepository paymentRepository,
            AuditService auditService
    ) {
        this.reservationRepository = reservationRepository;
        this.paymentRepository = paymentRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Map<String, Object> recordManual(User actor, UUID reservationId, ManualPaymentRequest body) {
        Reservation r = reservationRepository.findById(reservationId).orElseThrow(() -> new NotFoundException("reserva no encontrada"));
        Payment p = new Payment();
        p.setReservation(r);
        p.setStatus(PaymentStatus.PAGADO);
        p.setMethod(PaymentMethod.MANUAL);
        p.setExternalRef(body.externalRef());
        p.setAmount(body.amount());
        p.setRecordedBy(actor);
        Payment saved = paymentRepository.save(p);
        auditService.record(actor, "PAYMENT_MANUAL", "Payment", saved.getId().toString(), null,
                Map.of("reservationId", reservationId, "amount", body.amount()));
        return Map.of(
                "id", saved.getId(),
                "reservationId", reservationId,
                "status", saved.getStatus().name(),
                "amount", saved.getAmount()
        );
    }

    @Transactional
    public Map<String, Object> reverse(User actor, UUID paymentId) {
        Payment p = paymentRepository.findById(paymentId).orElseThrow(() -> new NotFoundException("pago no encontrado"));
        if (p.getStatus() != PaymentStatus.PAGADO) {
            throw new UnprocessableException("solo se puede reversar un pago en estado PAGADO");
        }
        Map<String, Object> before = Map.of("status", p.getStatus().name());
        p.setStatus(PaymentStatus.REVERSADO);
        paymentRepository.save(p);
        auditService.record(actor, "PAYMENT_REVERSE", "Payment", paymentId.toString(), before, Map.of("status", p.getStatus().name()));
        return Map.of("id", p.getId(), "status", p.getStatus().name());
    }
}
