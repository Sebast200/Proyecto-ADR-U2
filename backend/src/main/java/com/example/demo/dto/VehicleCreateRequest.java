package com.example.demo.dto;

public record VehicleCreateRequest(
    String plate,
    String brand,
    String fuelType,
    Integer userId  // Opcional, puede ser null
) {}
