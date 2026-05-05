package com.canchas.admin.court.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalTime;

public record PricingTierItemRequest(
        @Min(0) @Max(6) Integer dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull BigDecimal pricePerHour,
        String currency
) {
}
