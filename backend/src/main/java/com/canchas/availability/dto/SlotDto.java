package com.canchas.availability.dto;

import java.time.Instant;

public record SlotDto(Instant startAt, Instant endAt, boolean available) {
}
