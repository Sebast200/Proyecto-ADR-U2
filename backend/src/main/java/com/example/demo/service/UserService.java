package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repo.UserRepository;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.annotation.JsonIgnore;

import com.example.demo.dto.UserWithVehicleResponse;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ResilientConnectionManager connectionManager;
    
    // Constructor injection (mejor práctica)
    public UserService(UserRepository userRepository, ResilientConnectionManager connectionManager) {
        this.userRepository = userRepository;
        this.connectionManager = connectionManager;
    }

    // Devuelve todos los usuarios
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public String getMailById(Long id) {
        return userRepository.findById(id)
                .map(User::getEmail)
                .orElse(null);
    }
    
    public List<UserWithVehicleResponse> getAllUsersWithVehicles() {
        System.out.println("🔍 Consultando usuarios con sus vehículos asignados...");
        List<UserWithVehicleResponse> users = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection()) {
            String sql = "SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.rut, v.patente " +
                        "FROM users u " +
                        "LEFT JOIN vehiculo v ON u.id = v.id_usuario " +
                        "ORDER BY u.id";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                users.add(new UserWithVehicleResponse(
                    rs.getInt("id"),
                    rs.getString("email"),
                    rs.getString("first_name"),
                    rs.getString("last_name"),
                    rs.getString("role"),
                    rs.getString("rut"),
                    rs.getString("patente")
                ));
            }
            System.out.println("✅ Encontrados " + users.size() + " usuarios");
        } catch (Exception e) {
            System.err.println("❌ Error al obtener usuarios: " + e.getMessage());
            throw new RuntimeException("Error al obtener usuarios con vehículos", e);
        }
        return users;
    }

    public void deleteUser(Long userId) {
        System.out.println("🗑️ Eliminando usuario con ID: " + userId);
        try (Connection conn = connectionManager.getConnection()) {
            // Primero liberar el vehículo (poner id_usuario en NULL)
            String updateVehicleSql = "UPDATE vehiculo SET id_usuario = NULL WHERE id_usuario = ?";
            PreparedStatement updateStmt = conn.prepareStatement(updateVehicleSql);
            updateStmt.setLong(1, userId);
            int vehiclesReleased = updateStmt.executeUpdate();
            System.out.println("✅ Liberados " + vehiclesReleased + " vehículos");

            // Luego eliminar el usuario
            String deleteUserSql = "DELETE FROM users WHERE id = ?";
            PreparedStatement deleteStmt = conn.prepareStatement(deleteUserSql);
            deleteStmt.setLong(1, userId);
            int rowsDeleted = deleteStmt.executeUpdate();
            
            if (rowsDeleted > 0) {
                System.out.println("✅ Usuario eliminado correctamente");
            } else {
                System.out.println("⚠️ No se encontró usuario con ID: " + userId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar usuario: " + e.getMessage());
            throw new RuntimeException("Error al eliminar usuario", e);
        }
    }
}

