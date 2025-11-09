package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehiculo")
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "patente")
    private String plate;
    
    @Column(name = "marca")
    private String brand;
    
    @Column(name = "tipo_combustible")
    private String fuelType;
    
    @Column(name = "id_usuario")
    private Integer userId;

    // Constructors
    public Vehicle() {}

    public Vehicle(Integer id, String plate, String brand, String fuelType, Integer userId) {
        this.id = id;
        this.plate = plate;
        this.brand = brand;
        this.fuelType = fuelType;
        this.userId = userId;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
