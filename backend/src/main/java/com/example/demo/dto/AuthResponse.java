package com.example.demo.dto;

import com.example.demo.enums.Role;

public record AuthResponse(
        String message,
        String email,
        Role role
) {}
