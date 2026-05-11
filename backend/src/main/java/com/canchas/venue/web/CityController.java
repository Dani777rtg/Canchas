package com.canchas.venue.web;

import com.canchas.venue.dto.CityResponse;
import com.canchas.venue.repository.VenueRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoint público para listar ciudades (modeladas como Venues).
 * Devuelve únicamente id y nombre, ordenado alfabéticamente, para
 * alimentar el selector de ciudad del frontend antes de filtrar canchas.
 */
@RestController
@RequestMapping("/v1/cities")
public class CityController {

    private final VenueRepository venueRepository;

    public CityController(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @GetMapping
    public List<CityResponse> list() {
        return venueRepository.findAllByOrderByNameAsc().stream()
                .map(CityResponse::from)
                .toList();
    }
}
