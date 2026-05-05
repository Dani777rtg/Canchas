package com.canchas.reservation.dto;

import com.canchas.reservation.model.Reservation;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ReceiptResponse(
        String publicCode,
        UUID reservationId,
        String courtName,
        Instant startAt,
        Instant endAt,
        BigDecimal total,
        String currency,
        String note
) {
    public static ReceiptResponse from(Reservation r) {
        return new ReceiptResponse(
                r.getPublicCode(),
                r.getId(),
                r.getCourt().getName(),
                r.getStartAt(),
                r.getEndAt(),
                r.getTotal(),
                "COP",
                "Comprobante informativo (no es factura DIAN)."
        );
    }
}
