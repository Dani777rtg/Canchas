package com.canchas.reservation.web;

import com.canchas.reservation.dto.CreateReservationRequest;
import com.canchas.reservation.dto.PatchReservationRequest;
import com.canchas.reservation.dto.ReceiptResponse;
import com.canchas.reservation.dto.ReservationCreationResult;
import com.canchas.reservation.dto.ReservationResponse;
import com.canchas.reservation.service.ReservationService;
import com.canchas.user.model.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReservationRequest body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        ReservationCreationResult result = reservationService.create(user, body, idempotencyKey);
        if (result.replay()) {
            return ResponseEntity.status(result.httpStatus())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result.responseJson());
        }
        return ResponseEntity.status(201).body(result.body());
    }

    @GetMapping("/mine")
    public Page<ReservationResponse> mine(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return reservationService.listMine(user, page, limit);
    }

    @GetMapping("/{id}")
    public ReservationResponse getOne(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return reservationService.getById(user, id);
    }

    @PatchMapping("/{id}")
    public ReservationResponse patch(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody PatchReservationRequest body
    ) {
        return reservationService.patch(user, id, body);
    }

    @PostMapping("/{id}/cancel")
    public ReservationResponse cancel(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return reservationService.cancel(user, id);
    }

    @GetMapping("/{id}/receipt")
    public ReceiptResponse receipt(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return reservationService.receipt(user, id);
    }
}
