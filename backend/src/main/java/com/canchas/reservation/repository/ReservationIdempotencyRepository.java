package com.canchas.reservation.repository;

import com.canchas.reservation.model.ReservationIdempotency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReservationIdempotencyRepository extends JpaRepository<ReservationIdempotency, UUID> {

    Optional<ReservationIdempotency> findByUser_IdAndIdempotencyKey(UUID userId, String idempotencyKey);
}
