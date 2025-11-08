package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor injection (mejor práctica)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Devuelve todos los usuarios
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
