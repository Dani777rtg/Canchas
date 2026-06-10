package com.canchas.admin.reservation.web;

import com.canchas.admin.reservation.dto.AdminReservationResponse;
import com.canchas.admin.reservation.service.AdminReservationService;
import com.canchas.reservation.model.ReservationStatus;
import com.canchas.reservation.service.ReservationService;
import com.canchas.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/v1/admin/reservations")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminReservationController {

    private final AdminReservationService adminReservationService;
    private final ReservationService reservationService;

    public AdminReservationController(
            AdminReservationService adminReservationService,
            ReservationService reservationService
    ) {
        this.adminReservationService = adminReservationService;
        this.reservationService = reservationService;
    }

    @GetMapping
    public Page<AdminReservationResponse> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return adminReservationService.list(from, to, status, page, limit);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal User actor, @PathVariable UUID id) {
        reservationService.deleteAsAdmin(actor, id);
    }
}
