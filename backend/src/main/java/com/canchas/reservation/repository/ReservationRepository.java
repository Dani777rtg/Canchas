package com.canchas.reservation.repository;

import com.canchas.reservation.model.Reservation;
import com.canchas.reservation.model.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    @Query("""
            select r from Reservation r
            join fetch r.court c
            join fetch r.user u
            where r.id = :id
            """)
    Optional<Reservation> findDetailById(@Param("id") UUID id);

    Optional<Reservation> findByUser_IdAndIdempotencyKey(UUID userId, String idempotencyKey);

    Optional<Reservation> findByPublicCode(String publicCode);

    @Query("""
            select r from Reservation r
            where r.court.id = :courtId
              and r.status in :blocking
              and r.startAt < :end
              and r.endAt > :start
            """)
    List<Reservation> findOverlapping(
            @Param("courtId") UUID courtId,
            @Param("blocking") List<ReservationStatus> blocking,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    Page<Reservation> findByUser_Id(UUID userId, Pageable pageable);

    @Query("""
            select r from Reservation r
            where r.court.id = :courtId
              and r.status in :blocking
              and r.endAt > :from
            """)
    List<Reservation> findFutureBlockingByCourt(
            @Param("courtId") UUID courtId,
            @Param("blocking") List<ReservationStatus> blocking,
            @Param("from") Instant from
    );

    @Query("""
            select count(r) from Reservation r
            where r.court.id = :courtId
              and r.status in :blocking
              and r.startAt >= :start and r.startAt < :end
            """)
    long countByCourtAndStatusInRange(
            @Param("courtId") UUID courtId,
            @Param("blocking") List<ReservationStatus> blocking,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("""
            select coalesce(sum(r.total), 0) from Reservation r
            where r.status in :paidLike
              and r.startAt >= :start and r.startAt < :end
            """)
    java.math.BigDecimal sumTotalInRange(
            @Param("paidLike") List<ReservationStatus> paidLike,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query(
            value = """
                    select r from Reservation r
                    join r.court c
                    join c.venue v
                    join r.user u
                    where r.startAt >= :fromInstant and r.startAt < :toInstant
                    """,
            countQuery = """
                    select count(r) from Reservation r
                    where r.startAt >= :fromInstant and r.startAt < :toInstant
                    """
    )
    Page<Reservation> findAdminPage(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            Pageable pageable
    );

    @Query(
            value = """
                    select r from Reservation r
                    join r.court c
                    join c.venue v
                    join r.user u
                    where r.startAt >= :fromInstant and r.startAt < :toInstant
                      and r.status = :status
                    """,
            countQuery = """
                    select count(r) from Reservation r
                    where r.startAt >= :fromInstant and r.startAt < :toInstant
                      and r.status = :status
                    """
    )
    Page<Reservation> findAdminPageByStatus(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("status") ReservationStatus status,
            Pageable pageable
    );
}
