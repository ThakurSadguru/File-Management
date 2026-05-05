package com.example.File_Management_System;

import com.example.File_Management_System.repository.FileRepository;
import com.example.File_Management_System.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class TrashCleanupScheduler {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private FileService fileService;

    // ✅ Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanExpiredTrash() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        fileRepository.findAll().stream()
                .filter(f -> f.getDeletedAt() != null && f.getDeletedAt().isBefore(cutoff))
                .forEach(f -> {
                    try {
                        fileService.delete(f.getId());  // ✅ calls the no-userId overload
                    } catch (Exception e) {
                        System.err.println("Failed to auto-delete: " + f.getName());
                    }
                });
    }

}