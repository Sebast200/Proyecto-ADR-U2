package com.example.demo.dto;

public record UserWithVehicleResponse(
    Integer id,
    String email,
    String firstName,
    String lastName,
    String role,
    String rut,
    String vehiclePlate
) {}
