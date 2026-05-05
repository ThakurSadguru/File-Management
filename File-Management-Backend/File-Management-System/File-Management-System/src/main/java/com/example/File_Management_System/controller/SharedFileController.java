package com.example.File_Management_System.controller;

import com.example.File_Management_System.model.FileEntity;
import com.example.File_Management_System.model.SharedFileEntity;
import com.example.File_Management_System.model.UserEntity;
import com.example.File_Management_System.repository.FileRepository;
import com.example.File_Management_System.repository.SharedFileRepository;
import com.example.File_Management_System.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/share")
public class SharedFileController {

    @Autowired private SharedFileRepository sharedFileRepository;
    @Autowired private FileRepository fileRepository;
    @Autowired private UserRepository userRepository;

    // ✅ Share a file
    @PostMapping
    public ResponseEntity<?> share(@RequestBody Map<String, Long> body) {

        Long fromUserId = body.get("fromUserId");
        Long toUserId   = body.get("toUserId");
        Long fileId     = body.get("fileId");

        if (fromUserId == null || toUserId == null || fileId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields"));
        }

        Optional<FileEntity> fileOpt = fileRepository.findById(fileId);
        if (fileOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File not found"));
        }

        SharedFileEntity share = new SharedFileEntity();
        share.setFromUserId(fromUserId);
        share.setToUserId(toUserId);
        share.setFileId(fileId);
        share.setSharedAt(LocalDateTime.now());

        sharedFileRepository.save(share);

        return ResponseEntity.ok(buildShareDto(share));
    }

    // ✅ Files shared BY user
    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getSent(@PathVariable Long userId) {

        List<Map<String, Object>> result = sharedFileRepository
                .findByFromUserId(userId)
                .stream()
                .map(this::buildShareDto)
                .filter(Objects::nonNull)
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ Files shared WITH user
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getReceived(@PathVariable Long userId) {

        List<Map<String, Object>> result = sharedFileRepository
                .findByToUserId(userId)
                .stream()
                .map(this::buildShareDto)
                .filter(Objects::nonNull)
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ Revoke share
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {

        if (!sharedFileRepository.existsById(id)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Share not found"));
        }

        sharedFileRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "Share removed successfully"));
    }

    // ───────────────────────────────
    // ✅ DTO Builder
    // ───────────────────────────────
    private Map<String, Object> buildShareDto(SharedFileEntity s) {

        Optional<FileEntity> fileOpt = fileRepository.findById(s.getFileId());
        if (fileOpt.isEmpty()) return null;

        FileEntity f = fileOpt.get();

        String fromName = userRepository.findById(s.getFromUserId())
                .map(UserEntity::getName)
                .orElse("Unknown");

        String toName = userRepository.findById(s.getToUserId())
                .map(UserEntity::getName)
                .orElse("Unknown");

        String date = (s.getSharedAt() != null)
                ? s.getSharedAt().format(DateTimeFormatter.ofPattern("MMM d"))
                : "—";

        return Map.ofEntries(
                Map.entry("id", s.getId()),
                Map.entry("fileId", f.getId()),
                Map.entry("name", f.getName()),
                Map.entry("type", f.getType() != null ? f.getType() : "other"),
                Map.entry("size", f.getSize() != null ? f.getSize() : 0),
                Map.entry("url", f.getUrl() != null ? f.getUrl() : ""),
                Map.entry("fromId", s.getFromUserId()),
                Map.entry("fromName", fromName),
                Map.entry("toId", s.getToUserId()),
                Map.entry("toName", toName),
                Map.entry("date", date)
        );
    }
}


