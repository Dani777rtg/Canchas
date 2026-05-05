package com.canchas.admin.court.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record OpeningHourItemRequest(
        @NotNull @Min(0) @Max(6) Integer dayOfWeek,
        @NotNull LocalTime openTime,
        @NotNull LocalTime closeTime
) {
}
