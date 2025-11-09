package com.example.demo.controller;

import com.example.demo.dto.VehicleResponse;
import com.example.demo.dto.VehicleWithDriverResponse;
import com.example.demo.dto.VehicleCreateRequest;
import com.example.demo.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.trycloudflare.com"}, allowCredentials = "true")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        try {
            List<VehicleResponse> vehicles = vehicleService.getAllVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /vehicles: " + e.getMessage());
            // Devolver array vacío en lugar de error 500
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByUserId(@PathVariable Integer userId) {
        try {
            List<VehicleResponse> vehicles = vehicleService.getVehiclesByUserId(userId);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /vehicles/user/" + userId + ": " + e.getMessage());
            // Devolver array vacío en lugar de error 500
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Nuevos endpoints para obtener vehículos con información del conductor
    @GetMapping("/with-drivers")
    public ResponseEntity<List<VehicleWithDriverResponse>> getAllVehiclesWithDriver() {
        try {
            List<VehicleWithDriverResponse> vehicles = vehicleService.getAllVehiclesWithDriver();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /with-drivers: " + e.getMessage());
            // Devolver array vacío en lugar de error 500
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/with-drivers/user/{userId}")
    public ResponseEntity<List<VehicleWithDriverResponse>> getVehiclesWithDriverByUserId(@PathVariable Integer userId) {
        try {
            List<VehicleWithDriverResponse> vehicles = vehicleService.getVehiclesWithDriverByUserId(userId);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /with-drivers/user/" + userId + ": " + e.getMessage());
            // Devolver array vacío en lugar de error 500
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PutMapping("/{vehicleId}/assign/{userId}")
    public ResponseEntity<Void> assignVehicleToUser(@PathVariable Integer vehicleId, @PathVariable Integer userId) {
        try {
            vehicleService.assignVehicleToUser(vehicleId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("❌ Error al asignar vehículo " + vehicleId + " al usuario " + userId + ": " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody VehicleCreateRequest request) {
        try {
            VehicleResponse vehicle = vehicleService.createVehicle(request);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            System.err.println("❌ Error al crear vehículo: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al crear vehículo: " + e.getMessage());
        }
    }
}
