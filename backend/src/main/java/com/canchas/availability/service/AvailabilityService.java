package com.canchas.availability.service;

import com.canchas.availability.dto.CourtAvailabilityDto;
import com.canchas.availability.dto.SlotDto;
import com.canchas.common.time.BusinessTime;
import com.canchas.court.model.Court;
import com.canchas.court.model.CourtOpeningHour;
import com.canchas.court.model.CourtStatus;
import com.canchas.court.repository.CourtOpeningHourRepository;
import com.canchas.court.repository.CourtRepository;
import com.canchas.reservation.model.ReservationStatus;
import com.canchas.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AvailabilityService {

    private final CourtRepository courtRepository;
    private final CourtOpeningHourRepository openingHourRepository;
    private final ReservationRepository reservationRepository;
    private final BusinessTime businessTime;

    public AvailabilityService(
            CourtRepository courtRepository,
            CourtOpeningHourRepository openingHourRepository,
            ReservationRepository reservationRepository,
            BusinessTime businessTime
    ) {
        this.courtRepository = courtRepository;
        this.openingHourRepository = openingHourRepository;
        this.reservationRepository = reservationRepository;
        this.businessTime = businessTime;
    }

    private static List<ReservationStatus> blockingStatuses() {
        return List.of(ReservationStatus.CONFIRMADA, ReservationStatus.PENDIENTE_PAGO, ReservationStatus.FINALIZADA);
    }

    @Transactional(readOnly = true)
    public List<CourtAvailabilityDto> listAvailability(LocalDate date, UUID courtId, UUID venueId) {
        List<Court> courts;
        if (courtId != null) {
            courts = courtRepository.findById(courtId).stream().filter(c -> c.getStatus() == CourtStatus.ACTIVA).toList();
        } else if (venueId != null) {
            courts = courtRepository.findByVenue_Id(venueId).stream().filter(c -> c.getStatus() == CourtStatus.ACTIVA).toList();
        } else {
            courts = courtRepository.findAll().stream().filter(c -> c.getStatus() == CourtStatus.ACTIVA).toList();
        }

        List<CourtAvailabilityDto> out = new ArrayList<>();
        for (Court court : courts) {
            int dow = date.atStartOfDay(BusinessTime.ZONE).getDayOfWeek().getValue() % 7;
            List<CourtOpeningHour> hours = openingHourRepository.findByCourt_IdOrderByDayOfWeekAsc(court.getId());
            CourtOpeningHour day = hours.stream()
                    .filter(h -> h.getDayOfWeek() == dow)
                    .findFirst()
                    .orElse(null);
            if (day == null) {
                out.add(new CourtAvailabilityDto(court.getId(), court.getName(), List.of()));
                continue;
            }

            ZonedDateTime cursor = ZonedDateTime.of(date, day.getOpenTime(), BusinessTime.ZONE);
            ZonedDateTime dayClose = ZonedDateTime.of(date, day.getCloseTime(), BusinessTime.ZONE);

            List<SlotDto> slots = new ArrayList<>();
            while (cursor.plusHours(1).toInstant().compareTo(dayClose.toInstant()) <= 0) {
                Instant start = cursor.toInstant();
                Instant end = cursor.plusHours(1).toInstant();
                boolean overlap = !reservationRepository.findOverlapping(court.getId(), blockingStatuses(), start, end)
                        .isEmpty();
                slots.add(new SlotDto(start, end, !overlap));
                cursor = cursor.plusHours(1);
            }
            out.add(new CourtAvailabilityDto(court.getId(), court.getName(), slots));
        }
        return out;
    }
}
