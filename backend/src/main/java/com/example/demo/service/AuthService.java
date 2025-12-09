package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.User; // 👈 SOLUCIÓN AL ERROR DE 'USER'
import com.example.demo.enums.Role;
import com.example.demo.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet; // 👈 IMPORT NECESARIO PARA loginFallback()
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class); // 👈 LOGGER AÑADIDO

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Autowired
    private ResilientConnectionManager connectionManager;

    public AuthResponse register(RegisterRequest req) {
        try {
            // Intento normal con JPA (base local)
            if (userRepository.existsByEmail(req.email())) {
                log.warn("EVENT_SECURITY:AUTH_FAILED - Registration failed: Email '{}' already exists.", req.email());
                throw new RuntimeException("El correo ya está registrado");
            }
            if (userRepository.existsByRut(req.rut())) {
                log.warn("EVENT_SECURITY:AUTH_FAILED - Registration failed: RUT '{}' already exists.", req.rut());
                throw new RuntimeException("El RUT ya está registrado");
            }

            User user = User.builder()
                    .rut(req.rut().toLowerCase())
                    .email(req.email().toLowerCase())
                    .passwordHash(encoder.encode(req.password()))
                    .role(req.role() != null ? Role.valueOf(req.role().toUpperCase()) : Role.CHOFER)
                    .firstName(req.firstName())
                    .lastName(req.lastName())
                    .build();

            userRepository.save(user);

            // 👈 LOG DE ÉXITO DE REGISTRO
            log.info("EVENT_SECURITY:REGISTER_SUCCESS - New user registered with ID: {}", user.getId());
            return new AuthResponse(
                "Usuario registrado correctamente",
                user.getId(),
                user.getEmail(), 
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
            );
        } catch (Exception ex) {
            log.warn("⚠️ Fallo base local, intentando registrar en Supabase... Error: {}", ex.getMessage());
            return registerFallback(req);
        }
    }

    public AuthResponse login(LoginRequest req) {
        try {
            var userOpt = userRepository.findByEmail(req.rutOrEmail().toLowerCase())
                    .or(() -> userRepository.findByRut(req.rutOrEmail().toLowerCase()));

            if (userOpt.isEmpty()) {
                log.warn("EVENT_SECURITY:AUTH_FAILED - Login attempt for non-existent user/rut: {}", req.rutOrEmail());
                throw new RuntimeException("Usuario no encontrado");
            }

            User user = userOpt.get();

            if (!encoder.matches(req.password(), user.getPasswordHash())) {
                log.warn("EVENT_SECURITY:AUTH_FAILED - Invalid password for user: {} (ID: {})", user.getEmail(), user.getId());
                throw new RuntimeException("Contraseña incorrecta");
            }
            
            // 👈 LOG DE ÉXITO DE AUTENTICACIÓN
            log.info("EVENT_SECURITY:AUTH_SUCCESS:LOCAL - User '{}' (ID: {}) logged in successfully.", user.getEmail(), user.getId()); 
            
            return new AuthResponse(
                "Login exitoso",
                user.getId(),
                user.getEmail(), 
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
            );
        } catch (Exception ex) {
            log.warn("Login failed locally for '{}'. Falling back to Supabase. Error: {}", req.rutOrEmail(), ex.getMessage());
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

            // 👈 LOG DE ÉXITO DE FALLBACK
            log.info("EVENT_SECURITY:REGISTER_SUCCESS:FALLBACK - New user registered via Supabase: {}", req.email());
            return new AuthResponse(
                "Usuario registrado correctamente (Supabase)",
                null, // ID no disponible en el fallback
                req.email(),
                Role.valueOf(req.role().toUpperCase()),
                req.firstName(),
                req.lastName()
            );

        } catch (Exception e) {
            log.error("EVENT_SECURITY:AUTH_ERROR - Registration failed in both databases for user '{}'.", req.email(), e); // 👈 LOG CRÍTICO
            throw new RuntimeException("No se pudo registrar en ninguna base", e);
        }
    }

    private AuthResponse loginFallback(LoginRequest req) {
        try (Connection conn = connectionManager.getConnection()) {
            var stmt = conn.prepareStatement("SELECT * FROM users WHERE email = ? OR rut = ?");
            stmt.setString(1, req.rutOrEmail().toLowerCase());
            stmt.setString(2, req.rutOrEmail().toLowerCase());
            
            // Se necesita java.sql.ResultSet
            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                log.warn("EVENT_SECURITY:AUTH_FAILED:FALLBACK - User/RUT '{}' not found in Supabase.", req.rutOrEmail());
                throw new RuntimeException("Usuario no encontrado en Supabase");
            }

            String hash = rs.getString("password_hash");
            if (!encoder.matches(req.password(), hash)) {
                log.warn("EVENT_SECURITY:AUTH_FAILED:FALLBACK - Invalid password in Supabase for user: {}", rs.getString("email"));
                throw new RuntimeException("Contraseña incorrecta (Supabase)");
            }

            // 👈 LOG DE ÉXITO DE AUTENTICACIÓN FALLBACK
            log.info("EVENT_SECURITY:AUTH_SUCCESS:FALLBACK - User '{}' (ID: {}) logged in successfully via Supabase.", rs.getString("email"), rs.getLong("id"));
            
            return new AuthResponse(
                "Login exitoso (Supabase)",
                rs.getLong("id"),
                rs.getString("email"),
                Role.valueOf(rs.getString("role")),
                rs.getString("first_name"),
                rs.getString("last_name")
            );
        } catch (Exception e) {
            log.error("EVENT_SECURITY:AUTH_ERROR - Authentication failed in both databases for user '{}'.", req.rutOrEmail(), e);
            throw new RuntimeException("No se pudo autenticar en ninguna base", e);
        }
    }
}