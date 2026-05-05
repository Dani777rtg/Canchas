package com.canchas.admin.court.web;

import com.canchas.admin.court.dto.CourtSummaryResponse;
import com.canchas.admin.court.dto.CreateCourtRequest;
import com.canchas.admin.court.dto.OpeningHourItemRequest;
import com.canchas.admin.court.dto.PatchCourtRequest;
import com.canchas.admin.court.dto.PatchMaintenanceRequest;
import com.canchas.admin.court.dto.PricingTierItemRequest;
import com.canchas.admin.court.service.AdminCourtService;
import com.canchas.user.model.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/admin/courts")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminCourtController {

    private final AdminCourtService adminCourtService;

    public AdminCourtController(AdminCourtService adminCourtService) {
        this.adminCourtService = adminCourtService;
    }

    @GetMapping
    public List<CourtSummaryResponse> list() {
        return adminCourtService.listCourts();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourtSummaryResponse create(@AuthenticationPrincipal User actor, @Valid @RequestBody CreateCourtRequest body) {
        return adminCourtService.createCourt(actor, body);
    }

    @PatchMapping("/{id}")
    public CourtSummaryResponse patch(
            @AuthenticationPrincipal User actor,
            @PathVariable UUID id,
            @Valid @RequestBody PatchCourtRequest body
    ) {
        return adminCourtService.patchCourt(actor, id, body);
    }

    @GetMapping("/{id}/conflicts")
    public List<Map<String, Object>> conflicts(@PathVariable UUID id) {
        return adminCourtService.previewConflicts(id);
    }

    @PutMapping("/{id}/opening-hours")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void openingHours(
            @AuthenticationPrincipal User actor,
            @PathVariable UUID id,
            @Valid @RequestBody List<OpeningHourItemRequest> body
    ) {
        adminCourtService.replaceOpeningHours(actor, id, body);
    }

    @PutMapping("/{id}/pricing")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void pricing(
            @AuthenticationPrincipal User actor,
            @PathVariable UUID id,
            @Valid @RequestBody List<PricingTierItemRequest> body
    ) {
        adminCourtService.replacePricing(actor, id, body);
    }

    @PatchMapping("/{id}/maintenance")
    public CourtSummaryResponse maintenance(
            @AuthenticationPrincipal User actor,
            @PathVariable UUID id,
            @Valid @RequestBody PatchMaintenanceRequest body
    ) {
        return adminCourtService.patchMaintenance(actor, id, body);
    }
}
