package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.dto.UserWithVehicleResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

// 💡 Imports necesarios para el Logging de Seguridad
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.trycloudflare.com"}, allowCredentials = "true")
public class UserController {

    // 👈 1. INICIALIZAR LOGGER
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}/email")
    public ResponseEntity<String> getMailById(@PathVariable Long id) {
        String email = userService.getMailById(id);
        if (email != null) {
            return ResponseEntity.ok(email);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/with-vehicles")
    public ResponseEntity<List<UserWithVehicleResponse>> getAllUsersWithVehicles() {
        try {
            List<UserWithVehicleResponse> users = userService.getAllUsersWithVehicles();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /api/users/with-vehicles: " + e.getMessage());
            // Aunque System.err.println se recoge, es mejor usar el logger en el servicio.
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        String principalName = "ANONYMOUS";
        try {
            // Intenta obtener el nombre del usuario autenticado para el log
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                principalName = authentication.getName(); 
            }
        } catch (Exception ignored) {
            // Ignorado si no se puede obtener el usuario
        }

        // 👈 2. LOG DE ACCESO SENSIBLE (ANTES DE LA ACCIÓN)
        log.warn("EVENT_SECURITY:SENSIBLE_ACCESS:DELETE_USER - User '{}' attempting to DELETE user with ID: {}", principalName, userId);

        try {
            userService.deleteUser(userId);
            
            // 👈 3. LOG DE ÉXITO DE ACCIÓN SENSIBLE
            log.info("EVENT_SECURITY:ACTION_SUCCESS:DELETE_USER - User '{}' successfully DELETED user ID: {}", principalName, userId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // 👈 4. LOG DE FALLO DE ACCIÓN SENSIBLE/AUTORIZACIÓN
            log.error("EVENT_SECURITY:ACTION_FAILED:DELETE_USER - User '{}' failed to delete user ID: {}. Error: {}", principalName, userId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}