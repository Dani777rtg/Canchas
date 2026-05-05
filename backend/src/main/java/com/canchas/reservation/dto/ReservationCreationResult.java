package com.canchas.reservation.dto;

public record ReservationCreationResult(
        boolean replay,
        int httpStatus,
        String responseJson,
        ReservationResponse body
) {
    public static ReservationCreationResult replay(int httpStatus, String responseJson) {
        return new ReservationCreationResult(true, httpStatus, responseJson, null);
    }

    public static ReservationCreationResult created(ReservationResponse body) {
        return new ReservationCreationResult(false, 201, null, body);
    }
}
