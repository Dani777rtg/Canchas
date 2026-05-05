package com.canchas.report.service;

import com.canchas.common.time.BusinessTime;
import com.canchas.court.repository.CourtRepository;
import com.canchas.reservation.model.ReservationStatus;
import com.canchas.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final ReservationRepository reservationRepository;
    private final CourtRepository courtRepository;

    public ReportService(ReservationRepository reservationRepository, CourtRepository courtRepository) {
        this.reservationRepository = reservationRepository;
        this.courtRepository = courtRepository;
    }

    private Instant startOfDay(LocalDate date) {
        return date.atStartOfDay(BusinessTime.ZONE).toInstant();
    }

    private Instant endExclusive(LocalDate date) {
        return date.plusDays(1).atStartOfDay(BusinessTime.ZONE).toInstant();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> reservations(LocalDate from, LocalDate to) {
        Instant s = startOfDay(from);
        Instant e = endExclusive(to);
        List<ReservationStatus> blocking = List.of(
                ReservationStatus.CONFIRMADA,
                ReservationStatus.PENDIENTE_PAGO,
                ReservationStatus.FINALIZADA,
                ReservationStatus.CANCELADA,
                ReservationStatus.CANCELADA_TARDIA
        );
        long total = 0;
        for (var court : courtRepository.findAll()) {
            total += reservationRepository.countByCourtAndStatusInRange(court.getId(), blocking, s, e);
        }
        return Map.of("from", from.toString(), "to", to.toString(), "reservationCount", total);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> occupancy(LocalDate from, LocalDate to) {
        long courts = courtRepository.count();
        long days = Math.max(1, to.toEpochDay() - from.toEpochDay() + 1);
        long slotHoursPerDay = 14;
        long capacitySlots = courts * days * slotHoursPerDay;
        Map<String, Object> res = reservations(from, to);
        long used = (Long) res.get("reservationCount");
        double pct = capacitySlots == 0 ? 0 : (used * 100.0 / capacitySlots);
        return Map.of(
                "from", from.toString(),
                "to", to.toString(),
                "approxOccupancyPercent", Math.round(pct * 100.0) / 100.0,
                "note", "Estimacion simple: reservas / (canchas * dias * 14h)"
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> revenue(LocalDate from, LocalDate to) {
        Instant s = startOfDay(from);
        Instant e = endExclusive(to);
        List<ReservationStatus> paidLike = List.of(ReservationStatus.CONFIRMADA, ReservationStatus.FINALIZADA);
        BigDecimal sum = reservationRepository.sumTotalInRange(paidLike, s, e);
        return Map.of("from", from.toString(), "to", to.toString(), "totalCOP", sum);
    }
}
