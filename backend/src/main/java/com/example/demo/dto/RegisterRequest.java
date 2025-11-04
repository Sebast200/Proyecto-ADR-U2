package com.example.demo.dto;

import com.example.demo.enums.Role;

public record RegisterRequest(
        String rut,
        String email,
        String password,
        String firstName,
        String lastName,
        Role role
) {}
