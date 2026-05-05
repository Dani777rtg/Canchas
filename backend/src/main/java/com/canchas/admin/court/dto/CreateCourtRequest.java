package com.canchas.admin.court.dto;

import com.canchas.court.model.CourtStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateCourtRequest(
        @NotNull UUID venueId,
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 80) String sportType,
        @Size(max = 2000) String description,
        CourtStatus status
) {
    public CourtStatus statusOrDefault() {
        return status == null ? CourtStatus.ACTIVA : status;
    }
}
