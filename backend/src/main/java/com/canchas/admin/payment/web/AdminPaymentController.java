package com.canchas.admin.payment.web;

import com.canchas.admin.payment.dto.ManualPaymentRequest;
import com.canchas.admin.payment.service.AdminPaymentService;
import com.canchas.user.model.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/admin")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    public AdminPaymentController(AdminPaymentService adminPaymentService) {
        this.adminPaymentService = adminPaymentService;
    }

    @PostMapping("/reservations/{id}/payments/manual")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> manual(
            @AuthenticationPrincipal User actor,
            @PathVariable("id") UUID reservationId,
            @Valid @RequestBody ManualPaymentRequest body
    ) {
        return adminPaymentService.recordManual(actor, reservationId, body);
    }

    @PostMapping("/payments/{id}/reverse")
    public Map<String, Object> reverse(@AuthenticationPrincipal User actor, @PathVariable("id") UUID paymentId) {
        return adminPaymentService.reverse(actor, paymentId);
    }
}
