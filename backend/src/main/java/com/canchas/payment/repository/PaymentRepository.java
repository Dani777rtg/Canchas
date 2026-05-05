package com.canchas.payment.repository;

import com.canchas.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByReservation_Id(UUID reservationId);
}
