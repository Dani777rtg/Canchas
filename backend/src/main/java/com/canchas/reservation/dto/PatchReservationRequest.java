package com.canchas.reservation.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record PatchReservationRequest(
        @NotNull Instant startAt,
        @NotNull Instant endAt
) {
}
