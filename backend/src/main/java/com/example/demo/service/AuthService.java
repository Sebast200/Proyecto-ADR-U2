package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.repo.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Autowired
    private ResilientConnectionManager connectionManager;

    public AuthResponse register(RegisterRequest req) {
        try {
            // Intento normal con JPA (base local)
            if (userRepository.existsByEmail(req.email()))
                throw new RuntimeException("El correo ya está registrado");
            if (userRepository.existsByRut(req.rut()))
                throw new RuntimeException("El RUT ya está registrado");

            User user = User.builder()
                    .rut(req.rut().toLowerCase())
                    .email(req.email().toLowerCase())
                    .passwordHash(encoder.encode(req.password()))
                    .role(req.role() != null ? Role.valueOf(req.role().toUpperCase()) : Role.CHOFER)
                    .firstName(req.firstName())
                    .lastName(req.lastName())
                    .build();

            userRepository.save(user);

            System.out.println("✅ Usuario registrado en base local (JPA)");
            return new AuthResponse("Usuario registrado correctamente", user.getEmail(), user.getRole());
        } catch (Exception ex) {
            System.out.println("⚠️ Fallo base local, intentando registrar en Supabase...");
            return registerFallback(req);
        }
    }

    public AuthResponse login(LoginRequest req) {
        try {
            var userOpt = userRepository.findByEmail(req.rutOrEmail().toLowerCase())
                    .or(() -> userRepository.findByRut(req.rutOrEmail().toLowerCase()));

            if (userOpt.isEmpty())
                throw new RuntimeException("Usuario no encontrado");

            User user = userOpt.get();

            if (!encoder.matches(req.password(), user.getPasswordHash()))
                throw new RuntimeException("Contraseña incorrecta");

            return new AuthResponse("Login exitoso", user.getEmail(), user.getRole());
        } catch (Exception ex) {
            System.out.println("⚠️ Fallo base local, intentando login en Supabase...");
            return loginFallback(req);
        }
    }

    // === Fallbacks directos (en caso de caída local) ===

    private AuthResponse registerFallback(RegisterRequest req) {
        try (Connection conn = connectionManager.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO users (rut, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)");
            stmt.setString(1, req.rut().toLowerCase());
            stmt.setString(2, req.email().toLowerCase());
            stmt.setString(3, encoder.encode(req.password()));
            stmt.setString(4, req.firstName());
            stmt.setString(5, req.lastName());
            stmt.setString(6, req.role() != null ? Role.valueOf(req.role().toUpperCase()).name() : Role.CHOFER.name());

            stmt.executeUpdate();

            System.out.println("✅ Registro realizado en Supabase (fallback)");
            return new AuthResponse(
                "Usuario registrado correctamente (Supabase)",
                req.email(),
                Role.valueOf(req.role().toUpperCase())
            );

        } catch (Exception e) {
            throw new RuntimeException("No se pudo registrar en ninguna base", e);
        }
    }

    private AuthResponse loginFallback(LoginRequest req) {
        try (Connection conn = connectionManager.getConnection()) {
            var stmt = conn.prepareStatement("SELECT * FROM users WHERE email = ? OR rut = ?");
            stmt.setString(1, req.rutOrEmail().toLowerCase());
            stmt.setString(2, req.rutOrEmail().toLowerCase());
            var rs = stmt.executeQuery();

            if (!rs.next())
                throw new RuntimeException("Usuario no encontrado en Supabase");

            String hash = rs.getString("password_hash");
            if (!encoder.matches(req.password(), hash))
                throw new RuntimeException("Contraseña incorrecta (Supabase)");

            return new AuthResponse("Login exitoso (Supabase)", rs.getString("email"),
                    Role.valueOf(rs.getString("role")));
        } catch (Exception e) {
            throw new RuntimeException("No se pudo autenticar en ninguna base", e);
        }
    }
}
