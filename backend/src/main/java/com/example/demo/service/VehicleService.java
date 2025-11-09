package com.example.demo.service;

import com.example.demo.dto.VehicleResponse;
import com.example.demo.dto.VehicleWithDriverResponse;
import com.example.demo.dto.VehicleCreateRequest;
import com.example.demo.entity.Vehicle;
import com.example.demo.repo.VehicleRepository;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {
    
    private final VehicleRepository vehicleRepository;
    private final ResilientConnectionManager connectionManager;

    public VehicleService(VehicleRepository vehicleRepository, ResilientConnectionManager connectionManager) {
        this.vehicleRepository = vehicleRepository;
        this.connectionManager = connectionManager;
    }

    public List<VehicleResponse> getVehiclesByUserId(Integer userId) {
        // Usar directamente Supabase por ahora
        System.out.println("🔍 Consultando vehículos del usuario " + userId + " desde Supabase...");
        return getVehiclesFromSupabase(userId);
    }

    public List<VehicleResponse> getAllVehicles() {
        // Usar directamente Supabase por ahora
        System.out.println("🔍 Consultando vehículos desde Supabase directamente...");
        return getAllVehiclesFromSupabase();
    }

    private List<VehicleResponse> getVehiclesFromSupabase(Integer userId) {
        List<VehicleResponse> vehicles = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection()) {
            String sql = "SELECT id, patente, marca, tipo_combustible, id_usuario FROM vehiculo WHERE id_usuario = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                vehicles.add(new VehicleResponse(
                    rs.getInt("id"),
                    rs.getString("patente"),
                    rs.getString("marca"),
                    rs.getString("tipo_combustible"),
                    rs.getInt("id_usuario")
                ));
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener vehículos desde Supabase", e);
        }
        return vehicles;
    }

    private List<VehicleResponse> getAllVehiclesFromSupabase() {
        List<VehicleResponse> vehicles = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection()) {
            String sql = "SELECT id, patente, marca, tipo_combustible, id_usuario FROM vehiculo";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                vehicles.add(new VehicleResponse(
                    rs.getInt("id"),
                    rs.getString("patente"),
                    rs.getString("marca"),
                    rs.getString("tipo_combustible"),
                    rs.getInt("id_usuario")
                ));
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener vehículos desde Supabase", e);
        }
        return vehicles;
    }

    // Nuevos métodos para obtener vehículos con información del conductor
    public List<VehicleWithDriverResponse> getAllVehiclesWithDriver() {
        System.out.println("🔍 Consultando vehículos con información del conductor desde Supabase...");
        List<VehicleWithDriverResponse> vehicles = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection()) {
            String sql = "SELECT v.id, v.patente, v.marca, v.tipo_combustible, v.id_usuario, " +
                        "u.first_name, u.last_name, u.email " +
                        "FROM vehiculo v " +
                        "LEFT JOIN users u ON v.id_usuario = u.id";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                vehicles.add(new VehicleWithDriverResponse(
                    rs.getInt("id"),
                    rs.getString("patente"),
                    rs.getString("marca"),
                    rs.getString("tipo_combustible"),
                    rs.getInt("id_usuario"),
                    rs.getString("first_name"),
                    rs.getString("last_name"),
                    rs.getString("email")
                ));
            }
            System.out.println("✅ Encontrados " + vehicles.size() + " vehículos con conductor");
        } catch (Exception e) {
            System.err.println("❌ Error al obtener vehículos con conductor: " + e.getMessage());
            throw new RuntimeException("Error al obtener vehículos con información del conductor desde Supabase", e);
        }
        return vehicles;
    }

    public List<VehicleWithDriverResponse> getVehiclesWithDriverByUserId(Integer userId) {
        System.out.println("🔍 Consultando vehículos del usuario " + userId + " con información del conductor...");
        List<VehicleWithDriverResponse> vehicles = new ArrayList<>();
        try (Connection conn = connectionManager.getConnection()) {
            String sql = "SELECT v.id, v.patente, v.marca, v.tipo_combustible, v.id_usuario, " +
                        "u.first_name, u.last_name, u.email " +
                        "FROM vehiculo v " +
                        "LEFT JOIN users u ON v.id_usuario = u.id " +
                        "WHERE v.id_usuario = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                vehicles.add(new VehicleWithDriverResponse(
                    rs.getInt("id"),
                    rs.getString("patente"),
                    rs.getString("marca"),
                    rs.getString("tipo_combustible"),
                    rs.getInt("id_usuario"),
                    rs.getString("first_name"),
                    rs.getString("last_name"),
                    rs.getString("email")
                ));
            }
            System.out.println("✅ Encontrados " + vehicles.size() + " vehículos del usuario con conductor");
        } catch (Exception e) {
            System.err.println("❌ Error al obtener vehículos del usuario con conductor: " + e.getMessage());
            throw new RuntimeException("Error al obtener vehículos del usuario con información del conductor desde Supabase", e);
        }
        return vehicles;
    }
    
    public void assignVehicleToUser(Integer vehicleId, Integer userId) {
        System.out.println("🔄 Asignando vehículo " + vehicleId + " al usuario " + userId);
        try (Connection conn = connectionManager.getConnection()) {
            String sql = "UPDATE vehiculo SET id_usuario = ? WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            stmt.setInt(2, vehicleId);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("✅ Vehículo " + vehicleId + " asignado correctamente al usuario " + userId);
            } else {
                System.out.println("⚠ No se encontró el vehículo " + vehicleId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al asignar vehículo: " + e.getMessage());
            throw new RuntimeException("Error al asignar vehículo al usuario", e);
        }
    }
    
    public VehicleResponse createVehicle(VehicleCreateRequest request) {
        System.out.println("🚗 Creando nuevo vehículo: " + request.plate());
        try (Connection conn = connectionManager.getConnection()) {
            String sql = "INSERT INTO vehiculo (patente, marca, tipo_combustible, id_usuario) VALUES (?, ?, ?, ?) RETURNING id";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, request.plate());
            stmt.setString(2, request.brand());
            stmt.setString(3, request.fuelType());
            if (request.userId() != null) {
                stmt.setInt(4, request.userId());
            } else {
                stmt.setNull(4, java.sql.Types.INTEGER);
            }
            
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                int newId = rs.getInt("id");
                System.out.println("✅ Vehículo creado con ID: " + newId);
                return new VehicleResponse(newId, request.plate(), request.brand(), request.fuelType(), request.userId());
            } else {
                throw new RuntimeException("No se pudo obtener el ID del vehículo creado");
            }
        } catch (Exception e) {
            System.err.println("❌ Error al crear vehículo: " + e.getMessage());
            throw new RuntimeException("Error al crear vehículo", e);
        }
    }
}
