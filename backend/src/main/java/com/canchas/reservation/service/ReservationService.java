package com.canchas.reservation.service;

import com.canchas.audit.service.AuditService;
import com.canchas.common.exception.ConflictException;
import com.canchas.common.exception.ForbiddenException;
import com.canchas.common.exception.NotFoundException;
import com.canchas.common.exception.UnprocessableException;
import com.canchas.common.time.BusinessTime;
import com.canchas.court.model.Court;
import com.canchas.court.model.CourtOpeningHour;
import com.canchas.court.model.CourtStatus;
import com.canchas.court.model.PricingTier;
import com.canchas.court.repository.CourtOpeningHourRepository;
import com.canchas.court.repository.CourtRepository;
import com.canchas.court.repository.PricingTierRepository;
import com.canchas.payment.repository.PaymentRepository;
import com.canchas.reservation.dto.CreateReservationRequest;
import com.canchas.reservation.dto.PatchReservationRequest;
import com.canchas.reservation.dto.ReceiptResponse;
import com.canchas.reservation.dto.ReservationCreationResult;
import com.canchas.reservation.dto.ReservationResponse;
import com.canchas.reservation.model.CancellationType;
import com.canchas.reservation.model.Reservation;
import com.canchas.reservation.model.ReservationIdempotency;
import com.canchas.reservation.model.ReservationStatus;
import com.canchas.reservation.repository.ReservationIdempotencyRepository;
import com.canchas.reservation.repository.ReservationRepository;
import com.canchas.settings.model.CommercialSettings;
import com.canchas.settings.repository.CommercialSettingsRepository;
import com.canchas.user.model.User;
import com.canchas.user.model.UserRole;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReservationService {

    private static final int MIN_ADVANCE_MINUTES = 30;
    private static final int MAX_ADVANCE_DAYS = 30;
    private static final int MIN_DURATION_MINUTES = 60;
    private static final int MAX_DURATION_MINUTES = 180;
    private static final int CANCEL_FREE_HOURS = 6;
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final ReservationRepository reservationRepository;
    private final ReservationIdempotencyRepository idempotencyRepository;
    private final CourtRepository courtRepository;
    private final CourtOpeningHourRepository openingHourRepository;
    private final PricingTierRepository pricingTierRepository;
    private final CommercialSettingsRepository commercialSettingsRepository;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;
    private final BusinessTime businessTime;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    public ReservationService(
            ReservationRepository reservationRepository,
            ReservationIdempotencyRepository idempotencyRepository,
            CourtRepository courtRepository,
            CourtOpeningHourRepository openingHourRepository,
            PricingTierRepository pricingTierRepository,
            CommercialSettingsRepository commercialSettingsRepository,
            PaymentRepository paymentRepository,
            AuditService auditService,
            BusinessTime businessTime,
            ObjectMapper objectMapper
    ) {
        this.reservationRepository = reservationRepository;
        this.idempotencyRepository = idempotencyRepository;
        this.courtRepository = courtRepository;
        this.openingHourRepository = openingHourRepository;
        this.pricingTierRepository = pricingTierRepository;
        this.commercialSettingsRepository = commercialSettingsRepository;
        this.paymentRepository = paymentRepository;
        this.auditService = auditService;
        this.businessTime = businessTime;
        this.objectMapper = objectMapper;
    }

    private static List<ReservationStatus> blockingStatuses() {
        return List.of(ReservationStatus.CONFIRMADA, ReservationStatus.PENDIENTE_PAGO, ReservationStatus.FINALIZADA);
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> listMine(User user, int page, int limit) {
        int size = Math.min(Math.max(limit, 1), 100);
        Page<Reservation> p = reservationRepository.findByUser_Id(
                user.getId(),
                PageRequest.of(Math.max(page, 1) - 1, size, Sort.by(Sort.Direction.DESC, "startAt"))
        );
        return p.map(r -> ReservationResponse.from(loadDetail(r.getId())));
    }

    @Transactional(readOnly = true)
    public ReservationResponse getById(User user, UUID id) {
        Reservation r = loadDetail(id);
        if (!r.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMINISTRADOR) {
            throw new ForbiddenException("no autorizado");
        }
        return ReservationResponse.from(r);
    }

    @Transactional(readOnly = true)
    public ReceiptResponse receipt(User user, UUID id) {
        Reservation r = loadDetail(id);
        if (!r.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMINISTRADOR) {
            throw new ForbiddenException("no autorizado");
        }
        return ReceiptResponse.from(r);
    }

    @Transactional
    public ReservationCreationResult create(User user, CreateReservationRequest body, String idempotencyKey) {
        String key = idempotencyKey == null ? null : idempotencyKey.trim();
        if (key != null && !key.isEmpty()) {
            Optional<ReservationIdempotency> cached = idempotencyRepository.findByUser_IdAndIdempotencyKey(user.getId(), key);
            if (cached.isPresent()) {
                ReservationIdempotency row = cached.get();
                return ReservationCreationResult.replay(row.getHttpStatus(), row.getResponseBody());
            }
            Optional<Reservation> existing = reservationRepository.findByUser_IdAndIdempotencyKey(user.getId(), key);
            if (existing.isPresent()) {
                ReservationResponse dto = ReservationResponse.from(loadDetail(existing.get().getId()));
                return ReservationCreationResult.replay(201, writeJson(dto));
            }
        }

        try {
            Reservation saved = persistNewReservation(user, body, key);
            ReservationResponse dto = ReservationResponse.from(loadDetail(saved.getId()));
            if (key != null && !key.isEmpty()) {
                ReservationIdempotency row = new ReservationIdempotency();
                row.setUser(user);
                row.setIdempotencyKey(key);
                row.setResponseBody(writeJson(dto));
                row.setHttpStatus(201);
                idempotencyRepository.save(row);
            }
            return ReservationCreationResult.created(dto);
        } catch (DataIntegrityViolationException ex) {
            if (key != null && !key.isEmpty()) {
                return reservationRepository.findByUser_IdAndIdempotencyKey(user.getId(), key)
                        .map(r -> ReservationCreationResult.replay(201, writeJson(ReservationResponse.from(loadDetail(r.getId())))))
                        .orElseThrow(() -> ex);
            }
            throw ex;
        }
    }

    private Reservation persistNewReservation(User user, CreateReservationRequest body, String idempotencyKey) {
        Court court = courtRepository.findByIdForUpdate(body.courtId())
                .orElseThrow(() -> new NotFoundException("cancha no encontrada"));

        if (court.getStatus() != CourtStatus.ACTIVA) {
            throw new UnprocessableException("la cancha no acepta reservas en este estado");
        }

        validateBusinessRules(court.getId(), body.startAt(), body.endAt());

        List<Reservation> overlaps = reservationRepository.findOverlapping(
                court.getId(), blockingStatuses(), body.startAt(), body.endAt()
        );
        if (!overlaps.isEmpty()) {
            throw new ConflictException("horario no disponible");
        }

        CommercialSettings settings = loadCommercialSettings();
        ReservationStatus initial = parseInitialStatus(settings.getDefaultReservationStatus());

        PriceBreakdown price = computePrice(court.getId(), body.startAt(), body.endAt());

        Reservation r = new Reservation();
        r.setPublicCode(generatePublicCode());
        r.setCourt(court);
        r.setUser(user);
        r.setStartAt(body.startAt());
        r.setEndAt(body.endAt());
        r.setStatus(initial);
        r.setSubtotal(price.subtotal());
        r.setTaxAmount(price.tax());
        r.setTotal(price.total());
        r.setIdempotencyKey(idempotencyKey);
        return reservationRepository.save(r);
    }

    private ReservationStatus parseInitialStatus(String raw) {
        try {
            return ReservationStatus.valueOf(raw);
        } catch (Exception e) {
            return ReservationStatus.CONFIRMADA;
        }
    }

    private CommercialSettings loadCommercialSettings() {
        return commercialSettingsRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("commercial_settings no configurado"));
    }

    private void validateBusinessRules(UUID courtId, Instant startAt, Instant endAt) {
        Instant now = businessTime.nowInstant();
        if (!endAt.isAfter(startAt)) {
            throw new UnprocessableException("endAt debe ser posterior a startAt");
        }

        long minutes = Duration.between(startAt, endAt).toMinutes();
        if (minutes < MIN_DURATION_MINUTES || minutes > MAX_DURATION_MINUTES) {
            throw new UnprocessableException("duracion debe estar entre 1 y 3 horas");
        }

        if (!startAt.isAfter(now.plusSeconds(MIN_ADVANCE_MINUTES * 60L))) {
            throw new UnprocessableException("debe reservar con al menos 30 minutos de anticipacion");
        }

        ZonedDateTime zStart = businessTime.toZoned(startAt);
        ZonedDateTime zEnd = businessTime.toZoned(endAt);
        LocalDate dStart = zStart.toLocalDate();
        LocalDate dEnd = zEnd.toLocalDate();
        if (!dStart.equals(dEnd)) {
            throw new UnprocessableException("por ahora la reserva debe ser el mismo dia local (America/Bogota)");
        }

        LocalDate maxDate = businessTime.today().plusDays(MAX_ADVANCE_DAYS);
        if (dStart.isAfter(maxDate)) {
            throw new UnprocessableException("no se puede reservar con mas de 30 dias de anticipacion");
        }

        int dow = zStart.getDayOfWeek().getValue() % 7;
        List<CourtOpeningHour> hours = openingHourRepository.findByCourt_IdOrderByDayOfWeekAsc(courtId);
        CourtOpeningHour day = hours.stream()
                .filter(h -> h.getDayOfWeek() == dow)
                .findFirst()
                .orElseThrow(() -> new UnprocessableException("sin horario operativo para ese dia"));

        LocalTime open = day.getOpenTime();
        LocalTime close = day.getCloseTime();
        LocalTime tStart = zStart.toLocalTime();
        LocalTime tEnd = zEnd.toLocalTime();
        if (tStart.isBefore(open) || tEnd.isAfter(close)) {
            throw new UnprocessableException("fuera del horario habilitado de la cancha");
        }

        computePrice(courtId, startAt, endAt);
    }

    private PriceBreakdown computePrice(UUID courtId, Instant startAt, Instant endAt) {
        ZonedDateTime zStart = businessTime.toZoned(startAt);
        LocalTime startT = zStart.toLocalTime();
        int dow = zStart.getDayOfWeek().getValue() % 7;

        List<PricingTier> tiers = pricingTierRepository.findByCourt_Id(courtId);
        PricingTier tier = tiers.stream()
                .filter(t -> t.getDayOfWeek() == null || t.getDayOfWeek().equals(dow))
                .filter(t -> !startT.isBefore(t.getStartTime()) && startT.isBefore(t.getEndTime()))
                .findFirst()
                .orElseThrow(() -> new UnprocessableException("sin tarifa para el horario seleccionado"));

        long minutes = Duration.between(startAt, endAt).toMinutes();
        BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        BigDecimal subtotal = tier.getPricePerHour().multiply(hours).setScale(2, RoundingMode.HALF_UP);

        CommercialSettings settings = loadCommercialSettings();
        BigDecimal ivaRate = settings.getIvaPercent().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal tax = subtotal.multiply(ivaRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);
        return new PriceBreakdown(subtotal, tax, total);
    }

    private record PriceBreakdown(BigDecimal subtotal, BigDecimal tax, BigDecimal total) {
    }

    private String generatePublicCode() {
        for (int attempt = 0; attempt < 20; attempt++) {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(CODE_ALPHABET.charAt(secureRandom.nextInt(CODE_ALPHABET.length())));
            }
            String code = sb.toString();
            if (reservationRepository.findByPublicCode(code).isEmpty()) {
                return code;
            }
        }
        throw new IllegalStateException("no se pudo generar public_code");
    }

    private String writeJson(ReservationResponse dto) {
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    private Reservation loadDetail(UUID id) {
        return reservationRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("reserva no encontrada"));
    }

    @Transactional
    public ReservationResponse cancel(User user, UUID id) {
        Reservation r = loadDetail(id);
        if (!r.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMINISTRADOR) {
            throw new ForbiddenException("no autorizado");
        }
        if (r.getStatus() == ReservationStatus.CANCELADA || r.getStatus() == ReservationStatus.CANCELADA_TARDIA) {
            throw new UnprocessableException("reserva ya cancelada");
        }
        if (r.getStatus() == ReservationStatus.FINALIZADA) {
            throw new UnprocessableException("reserva finalizada no cancelable");
        }

        Instant now = businessTime.nowInstant();
        if (!r.getStartAt().isAfter(now)) {
            throw new UnprocessableException("no se puede cancelar una reserva ya iniciada o vencida");
        }

        Duration untilStart = Duration.between(now, r.getStartAt());
        if (untilStart.toHours() >= CANCEL_FREE_HOURS) {
            r.setStatus(ReservationStatus.CANCELADA);
            r.setCancellationType(CancellationType.TEMPRANA);
        } else {
            r.setStatus(ReservationStatus.CANCELADA_TARDIA);
            r.setCancellationType(CancellationType.TARDIA);
        }
        reservationRepository.save(r);
        return ReservationResponse.from(loadDetail(r.getId()));
    }

    @Transactional
    public void deleteByOwner(User user, UUID id) {
        Reservation r = loadDetail(id);
        if (!r.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("no autorizado");
        }
        purgeReservation(r, user, false);
    }

    @Transactional
    public void deleteAsAdmin(User actor, UUID id) {
        Reservation r = loadDetail(id);
        purgeReservation(r, actor, true);
    }

    private void purgeReservation(Reservation r, User actor, boolean asAdmin) {
        UUID id = r.getId();
        paymentRepository.deleteByReservation_Id(id);
        if (asAdmin) {
            auditService.record(
                    actor,
                    "RESERVATION_DELETE",
                    "Reservation",
                    id.toString(),
                    Map.of(
                            "publicCode", r.getPublicCode(),
                            "status", r.getStatus().name(),
                            "userId", r.getUser().getId().toString()
                    ),
                    null
            );
        }
        reservationRepository.delete(r);
    }

    @Transactional
    public ReservationResponse patch(User user, UUID id, PatchReservationRequest body) {
        Reservation r = loadDetail(id);
        if (!r.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMINISTRADOR) {
            throw new ForbiddenException("no autorizado");
        }
        if (r.getStatus() == ReservationStatus.FINALIZADA) {
            throw new UnprocessableException("reserva finalizada no editable");
        }
        if (r.getStatus() == ReservationStatus.CANCELADA || r.getStatus() == ReservationStatus.CANCELADA_TARDIA) {
            throw new UnprocessableException("reserva cancelada no editable");
        }

        Instant now = businessTime.nowInstant();
        if (!r.getStartAt().isAfter(now)) {
            throw new UnprocessableException("no se puede modificar una reserva ya iniciada");
        }

        courtRepository.findByIdForUpdate(r.getCourt().getId()).orElseThrow();

        validateBusinessRules(r.getCourt().getId(), body.startAt(), body.endAt());

        List<Reservation> overlaps = reservationRepository.findOverlapping(
                r.getCourt().getId(), blockingStatuses(), body.startAt(), body.endAt()
        );
        boolean conflict = overlaps.stream().anyMatch(o -> !o.getId().equals(r.getId()));
        if (conflict) {
            throw new ConflictException("horario no disponible");
        }

        PriceBreakdown price = computePrice(r.getCourt().getId(), body.startAt(), body.endAt());
        r.setStartAt(body.startAt());
        r.setEndAt(body.endAt());
        r.setSubtotal(price.subtotal());
        r.setTaxAmount(price.tax());
        r.setTotal(price.total());
        reservationRepository.save(r);
        return ReservationResponse.from(loadDetail(r.getId()));
    }
}
