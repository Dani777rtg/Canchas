package com.canchas.reservation.dto;

import com.canchas.reservation.model.CancellationType;
import com.canchas.reservation.model.Reservation;
import com.canchas.reservation.model.ReservationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        String publicCode,
        UUID courtId,
        String courtName,
        UUID userId,
        Instant startAt,
        Instant endAt,
        ReservationStatus status,
        CancellationType cancellationType,
        boolean noShow,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal total
) {
    public static ReservationResponse from(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getPublicCode(),
                r.getCourt().getId(),
                r.getCourt().getName(),
                r.getUser().getId(),
                r.getStartAt(),
                r.getEndAt(),
                r.getStatus(),
                r.getCancellationType(),
                r.isNoShow(),
                r.getSubtotal(),
                r.getTaxAmount(),
                r.getTotal()
        );
    }
}
