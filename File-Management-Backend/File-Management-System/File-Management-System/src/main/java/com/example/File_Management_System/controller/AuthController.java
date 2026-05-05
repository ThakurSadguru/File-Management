package com.example.File_Management_System.controller;

import com.example.File_Management_System.model.UserEntity;
import com.example.File_Management_System.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name  = body.get("name");
        String password = body.get("password");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already registered"));
        }

        UserEntity user = new UserEntity();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // plain text for now — add BCrypt later
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        Optional<UserEntity> found = userRepository.findByEmail(email);

        if (found.isEmpty() || !found.get().getPassword().equals(password)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
        }

        UserEntity user = found.get();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        UserEntity user = userRepository.findById(id).orElseThrow();
        if (body.get("name") != null) user.setName(body.get("name"));
        if (body.get("email") != null) user.setEmail(body.get("email"));
        if (body.get("password") != null && !body.get("password").isBlank()) {
            user.setPassword(body.get("password"));
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }
}