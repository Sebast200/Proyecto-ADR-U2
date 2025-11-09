package com.example.demo.entity;

import com.example.demo.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore; // 👈 agrega este import
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String rut;

    @Column(nullable=false, unique=true)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable=false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role;

    private String firstName;
    private String lastName;
}
