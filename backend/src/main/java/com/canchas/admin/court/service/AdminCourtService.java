package com.canchas.admin.court.service;

import com.canchas.admin.court.dto.CourtSummaryResponse;
import com.canchas.admin.court.dto.CreateCourtRequest;
import com.canchas.admin.court.dto.OpeningHourItemRequest;
import com.canchas.admin.court.dto.PatchCourtRequest;
import com.canchas.admin.court.dto.PatchMaintenanceRequest;
import com.canchas.admin.court.dto.PricingTierItemRequest;
import com.canchas.audit.service.AuditService;
import com.canchas.common.exception.NotFoundException;
import com.canchas.court.model.Court;
import com.canchas.court.model.CourtOpeningHour;
import com.canchas.court.model.PricingTier;
import com.canchas.court.repository.CourtOpeningHourRepository;
import com.canchas.court.repository.CourtRepository;
import com.canchas.court.repository.PricingTierRepository;
import com.canchas.reservation.model.ReservationStatus;
import com.canchas.reservation.repository.ReservationRepository;
import com.canchas.user.model.User;
import com.canchas.venue.model.Venue;
import com.canchas.venue.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminCourtService {

    private final CourtRepository courtRepository;
    private final VenueRepository venueRepository;
    private final CourtOpeningHourRepository openingHourRepository;
    private final PricingTierRepository pricingTierRepository;
    private final ReservationRepository reservationRepository;
    private final AuditService auditService;

    public AdminCourtService(
            CourtRepository courtRepository,
            VenueRepository venueRepository,
            CourtOpeningHourRepository openingHourRepository,
            PricingTierRepository pricingTierRepository,
            ReservationRepository reservationRepository,
            AuditService auditService
    ) {
        this.courtRepository = courtRepository;
        this.venueRepository = venueRepository;
        this.openingHourRepository = openingHourRepository;
        this.pricingTierRepository = pricingTierRepository;
        this.reservationRepository = reservationRepository;
        this.auditService = auditService;
    }

    private static List<ReservationStatus> blockingStatuses() {
        return List.of(ReservationStatus.CONFIRMADA, ReservationStatus.PENDIENTE_PAGO, ReservationStatus.FINALIZADA);
    }

    @Transactional(readOnly = true)
    public List<CourtSummaryResponse> listCourts() {
        return courtRepository.findAll().stream().map(CourtSummaryResponse::from).toList();
    }

    @Transactional
    public CourtSummaryResponse createCourt(User actor, CreateCourtRequest body) {
        Venue venue = venueRepository.findById(body.venueId())
                .orElseThrow(() -> new NotFoundException("sede no encontrada"));
        Court c = new Court();
        c.setVenue(venue);
        c.setName(body.name().trim());
        c.setSportType(body.sportType().trim());
        c.setDescription(body.description());
        c.setStatus(body.statusOrDefault());
        Court saved = courtRepository.save(c);
        auditService.record(actor, "COURT_CREATE", "Court", saved.getId().toString(), null, Map.of("id", saved.getId(), "name", saved.getName()));
        return CourtSummaryResponse.from(reload(saved.getId()));
    }

    @Transactional
    public CourtSummaryResponse patchCourt(User actor, UUID id, PatchCourtRequest body) {
        Court c = courtRepository.findById(id).orElseThrow(() -> new NotFoundException("cancha no encontrada"));
        Map<String, Object> before = Map.of("name", c.getName(), "sportType", c.getSportType(), "status", c.getStatus());
        if (body.name() != null) {
            c.setName(body.name().trim());
        }
        if (body.sportType() != null) {
            c.setSportType(body.sportType().trim());
        }
        if (body.description() != null) {
            c.setDescription(body.description());
        }
        if (body.status() != null) {
            c.setStatus(body.status());
        }
        courtRepository.save(c);
        auditService.record(actor, "COURT_PATCH", "Court", id.toString(), before,
                Map.of("name", c.getName(), "sportType", c.getSportType(), "status", c.getStatus()));
        return CourtSummaryResponse.from(reload(id));
    }

    @Transactional
    public void replaceOpeningHours(User actor, UUID courtId, List<OpeningHourItemRequest> items) {
        Court court = courtRepository.findById(courtId).orElseThrow(() -> new NotFoundException("cancha no encontrada"));
        openingHourRepository.deleteByCourt_Id(courtId);
        for (OpeningHourItemRequest it : items) {
            CourtOpeningHour h = new CourtOpeningHour();
            h.setCourt(court);
            h.setDayOfWeek(it.dayOfWeek());
            h.setOpenTime(it.openTime());
            h.setCloseTime(it.closeTime());
            openingHourRepository.save(h);
        }
        auditService.record(actor, "COURT_OPENING_HOURS", "Court", courtId.toString(), null, Map.of("days", items.size()));
    }

    @Transactional
    public void replacePricing(User actor, UUID courtId, List<PricingTierItemRequest> items) {
        Court court = courtRepository.findById(courtId).orElseThrow(() -> new NotFoundException("cancha no encontrada"));
        pricingTierRepository.deleteByCourt_Id(courtId);
        for (PricingTierItemRequest it : items) {
            PricingTier t = new PricingTier();
            t.setCourt(court);
            t.setDayOfWeek(it.dayOfWeek());
            t.setStartTime(it.startTime());
            t.setEndTime(it.endTime());
            t.setPricePerHour(it.pricePerHour());
            t.setCurrency(it.currency() == null || it.currency().isBlank() ? "COP" : it.currency());
            pricingTierRepository.save(t);
        }
        auditService.record(actor, "COURT_PRICING", "Court", courtId.toString(), null, Map.of("tiers", items.size()));
    }

    @Transactional
    public CourtSummaryResponse patchMaintenance(User actor, UUID courtId, PatchMaintenanceRequest body) {
        Court c = courtRepository.findById(courtId).orElseThrow(() -> new NotFoundException("cancha no encontrada"));
        Map<String, Object> before = Map.of("status", c.getStatus(), "note", String.valueOf(c.getMaintenanceNote()));
        c.setStatus(body.status());
        c.setMaintenanceNote(body.maintenanceNote());
        courtRepository.save(c);
        auditService.record(actor, "COURT_MAINTENANCE", "Court", courtId.toString(), before,
                Map.of("status", c.getStatus(), "note", c.getMaintenanceNote()));
        return CourtSummaryResponse.from(reload(courtId));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> previewConflicts(UUID courtId) {
        courtRepository.findById(courtId).orElseThrow(() -> new NotFoundException("cancha no encontrada"));
        return reservationRepository.findFutureBlockingByCourt(courtId, blockingStatuses(), Instant.now()).stream()
                .map(r -> Map.<String, Object>of(
                        "reservationId", r.getId(),
                        "startAt", r.getStartAt().toString(),
                        "endAt", r.getEndAt().toString(),
                        "status", r.getStatus().name()
                ))
                .toList();
    }

    private Court reload(UUID id) {
        return courtRepository.findById(id).orElseThrow();
    }
}
