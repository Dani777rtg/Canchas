package com.canchas.admin.reservation.service;

import com.canchas.admin.reservation.dto.AdminReservationResponse;
import com.canchas.common.time.BusinessTime;
import com.canchas.payment.model.Payment;
import com.canchas.payment.model.PaymentStatus;
import com.canchas.payment.repository.PaymentRepository;
import com.canchas.reservation.model.Reservation;
import com.canchas.reservation.model.ReservationStatus;
import com.canchas.reservation.repository.ReservationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminReservationService {

    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;

    public AdminReservationService(
            ReservationRepository reservationRepository,
            PaymentRepository paymentRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.paymentRepository = paymentRepository;
    }

    private Instant startOfDay(LocalDate date) {
        return date.atStartOfDay(BusinessTime.ZONE).toInstant();
    }

    private Instant endExclusive(LocalDate date) {
        return date.plusDays(1).atStartOfDay(BusinessTime.ZONE).toInstant();
    }

    @Transactional(readOnly = true)
    public Page<AdminReservationResponse> list(LocalDate from, LocalDate to, ReservationStatus status, int page, int limit) {
        int size = Math.min(Math.max(limit, 1), 100);
        var pageable = PageRequest.of(Math.max(page, 1) - 1, size, Sort.by(Sort.Direction.DESC, "startAt"));
        Instant fromInstant = startOfDay(from);
        Instant toInstant = endExclusive(to);

        Page<Reservation> raw = status == null
                ? reservationRepository.findAdminPage(fromInstant, toInstant, pageable)
                : reservationRepository.findAdminPageByStatus(fromInstant, toInstant, status, pageable);

        List<UUID> reservationIds = raw.getContent().stream().map(Reservation::getId).toList();
        Map<UUID, PaymentStatus> paymentByReservation = resolveLatestPaymentStatus(reservationIds);

        return raw.map(r -> AdminReservationResponse.from(
                r,
                paymentByReservation.getOrDefault(r.getId(), PaymentStatus.PENDIENTE)
        ));
    }

    private Map<UUID, PaymentStatus> resolveLatestPaymentStatus(List<UUID> reservationIds) {
        if (reservationIds.isEmpty()) {
            return Map.of();
        }
        return paymentRepository.findByReservation_IdIn(reservationIds).stream()
                .collect(Collectors.groupingBy(
                        p -> p.getReservation().getId(),
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparing(Payment::getCreatedAt)),
                                opt -> opt.map(Payment::getStatus).orElse(PaymentStatus.PENDIENTE)
                        )
                ));
    }
}
