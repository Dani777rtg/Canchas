package com.canchas.admin.court.dto;

import com.canchas.court.model.Court;
import com.canchas.court.model.CourtStatus;

import java.util.UUID;

public record CourtSummaryResponse(
        UUID id,
        UUID venueId,
        String name,
        String sportType,
        CourtStatus status,
        String maintenanceNote
) {
    public static CourtSummaryResponse from(Court c) {
        return new CourtSummaryResponse(
                c.getId(),
                c.getVenue().getId(),
                c.getName(),
                c.getSportType(),
                c.getStatus(),
                c.getMaintenanceNote()
        );
    }
}
