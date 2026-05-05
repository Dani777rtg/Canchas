package com.canchas.court.repository;

import com.canchas.court.model.CourtOpeningHour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourtOpeningHourRepository extends JpaRepository<CourtOpeningHour, UUID> {

    void deleteByCourt_Id(UUID courtId);

    List<CourtOpeningHour> findByCourt_IdOrderByDayOfWeekAsc(UUID courtId);
}
