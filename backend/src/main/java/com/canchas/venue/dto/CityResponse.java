package com.canchas.venue.dto;

import com.canchas.venue.model.Venue;

import java.util.UUID;

public record CityResponse(UUID id, String name) {

    public static CityResponse from(Venue v) {
        return new CityResponse(v.getId(), v.getName());
    }
}
