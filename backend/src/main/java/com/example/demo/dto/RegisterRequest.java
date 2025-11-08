package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RegisterRequest(
    @JsonProperty("rut") String rut,
    @JsonProperty("email") String email,
    @JsonProperty("password") String password,
    @JsonProperty("firstName") String firstName,
    @JsonProperty("lastName") String lastName,
    @JsonProperty("role") String role  // 👈 importante: ahora es String, no enum
) {}
