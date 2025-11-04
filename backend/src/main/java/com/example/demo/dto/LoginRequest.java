package com.example.demo.dto;

public record LoginRequest(
        String rutOrEmail,
        String password
) {}
