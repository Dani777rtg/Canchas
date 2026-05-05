package com.canchas.common.time;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class BusinessTime {

    public static final ZoneId ZONE = ZoneId.of("America/Bogota");

    private final Clock clock;

    public BusinessTime(Clock clock) {
        this.clock = clock;
    }

    public Instant nowInstant() {
        return clock.instant();
    }

    public ZonedDateTime nowInBusinessZone() {
        return ZonedDateTime.now(clock.withZone(ZONE));
    }

    public ZonedDateTime toZoned(Instant instant) {
        return instant.atZone(ZONE);
    }

    public LocalDate today() {
        return nowInBusinessZone().toLocalDate();
    }
}
