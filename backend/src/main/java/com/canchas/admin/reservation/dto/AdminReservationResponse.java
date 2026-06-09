package com.canchas.admin.reservation.dto;

import com.canchas.payment.model.PaymentStatus;
import com.canchas.reservation.model.Reservation;
import com.canchas.reservation.model.ReservationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminReservationResponse(
        UUID id,
        String publicCode,
        UUID courtId,
        String courtName,
        String venueName,
        UUID userId,
        String userEmail,
        String userFullName,
        Instant startAt,
        Instant endAt,
        ReservationStatus status,
        PaymentStatus paymentStatus,
        BigDecimal total
) {
    public static AdminReservationResponse from(Reservation r, PaymentStatus paymentStatus) {
        return new AdminReservationResponse(
                r.getId(),
                r.getPublicCode(),
                r.getCourt().getId(),
                r.getCourt().getName(),
                r.getCourt().getVenue().getName(),
                r.getUser().getId(),
                r.getUser().getEmail(),
                r.getUser().getFullName(),
                r.getStartAt(),
                r.getEndAt(),
                r.getStatus(),
                paymentStatus,
                r.getTotal()
        );
    }
}
