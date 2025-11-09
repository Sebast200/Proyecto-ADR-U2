package com.example.demo.dto;

public record VehicleResponse(
    Integer id,
    String plate,
    String brand,
    String fuelType,
    Integer userId
) {}
