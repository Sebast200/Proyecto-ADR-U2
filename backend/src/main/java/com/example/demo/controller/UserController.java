package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@RequestMapping("/api/user/all") // Base URL de los endpoints de usuarios
import com.example.demo.dto.UserWithVehicleResponse;
import com.example.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.trycloudflare.com"}, allowCredentials = "true")
public class UserController {

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
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
