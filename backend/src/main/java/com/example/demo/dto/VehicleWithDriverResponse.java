package com.example.demo.dto;

public record VehicleWithDriverResponse(
    Integer id,
    String plate,
    String brand,
    String fuelType,
    Integer userId,
    String driverFirstName,
    String driverLastName,
    String driverEmail
) {}
