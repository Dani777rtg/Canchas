package com.canchas.payment.repository;

import com.canchas.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByReservation_Id(UUID reservationId);

    @Modifying
    @Query("delete from Payment p where p.reservation.id = :reservationId")
    void deleteByReservation_Id(@Param("reservationId") UUID reservationId);

    @Query("select p from Payment p join fetch p.reservation r where r.id in :ids")
    List<Payment> findByReservation_IdIn(@Param("ids") List<UUID> ids);
}
