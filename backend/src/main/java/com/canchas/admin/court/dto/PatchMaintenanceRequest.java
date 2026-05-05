package com.canchas.admin.court.dto;

import com.canchas.court.model.CourtStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PatchMaintenanceRequest(
        @NotNull CourtStatus status,
        @Size(max = 500) String maintenanceNote
) {
}
