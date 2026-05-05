package com.canchas.reservation.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record CreateReservationRequest(
        @NotNull UUID courtId,
        @NotNull Instant startAt,
        @NotNull Instant endAt
) {
}
