package com.canchas.admin.court.dto;

import com.canchas.court.model.CourtStatus;
import jakarta.validation.constraints.Size;

public record PatchCourtRequest(
        @Size(max = 120) String name,
        @Size(max = 80) String sportType,
        @Size(max = 2000) String description,
        CourtStatus status
) {
}
