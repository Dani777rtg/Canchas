package com.canchas.admin.payment.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ManualPaymentRequest(
        @NotNull BigDecimal amount,
        String externalRef
) {
}
