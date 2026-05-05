package com.canchas.availability.dto;

import java.util.List;
import java.util.UUID;

public record CourtAvailabilityDto(UUID courtId, String courtName, List<SlotDto> slots) {
}
