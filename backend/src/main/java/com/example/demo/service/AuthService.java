package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email()))
            throw new RuntimeException("El correo ya está registrado");
        if (userRepository.existsByRut(req.rut()))
            throw new RuntimeException("El RUT ya está registrado");

        User user = User.builder()
                .rut(req.rut().toLowerCase())
                .email(req.email().toLowerCase())
                .passwordHash(encoder.encode(req.password()))
                .role(req.role() != null ? req.role() : Role.CHOFER)
                .firstName(req.firstName())
                .lastName(req.lastName())
                .build();

        userRepository.save(user);

        return new AuthResponse("Usuario registrado correctamente", user.getEmail(), user.getRole());
    }

    public AuthResponse login(LoginRequest req) {
        var userOpt = userRepository.findByEmail(req.rutOrEmail().toLowerCase())
                .or(() -> userRepository.findByRut(req.rutOrEmail().toLowerCase()));

        if (userOpt.isEmpty())
            throw new RuntimeException("Usuario no encontrado");

        User user = userOpt.get();

        if (!encoder.matches(req.password(), user.getPasswordHash()))
            throw new RuntimeException("Contraseña incorrecta");

        return new AuthResponse("Login exitoso", user.getEmail(), user.getRole());
    }
}
