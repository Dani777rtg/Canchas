package com.canchas.settings.repository;

import com.canchas.settings.model.CommercialSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommercialSettingsRepository extends JpaRepository<CommercialSettings, UUID> {
}
