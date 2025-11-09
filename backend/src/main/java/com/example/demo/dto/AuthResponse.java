package com.example.demo.dto;

import com.example.demo.enums.Role;

public record AuthResponse(
        String message,
        Long userId,
        String email,
        Role role,
        String firstName,
        String lastName
) {}
