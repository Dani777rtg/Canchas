package com.canchas.court.repository;

import com.canchas.court.model.PricingTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PricingTierRepository extends JpaRepository<PricingTier, UUID> {

    void deleteByCourt_Id(UUID courtId);

    List<PricingTier> findByCourt_Id(UUID courtId);
}
