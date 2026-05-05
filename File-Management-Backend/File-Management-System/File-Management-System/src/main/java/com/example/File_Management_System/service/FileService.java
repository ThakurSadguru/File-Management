package com.example.File_Management_System.service;

import com.example.File_Management_System.model.FileEntity;
import com.example.File_Management_System.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    public List<FileEntity> getByFolder(String folderId, Long userId) {
        return fileRepository.findByFolderIdAndUserIdAndDeletedAtIsNull(folderId, userId);
    }

    public List<FileEntity> getAll(Long userId) {
        return fileRepository.findByUserIdAndDeletedAtIsNull(userId);
    }

    public List<FileEntity> getTrash(Long userId) {
        return fileRepository.findByUserIdAndDeletedAtIsNotNull(userId);
    }

    public Long getTotalSize(Long userId) {
        return fileRepository.sumSizeByUserId(userId);
    }

    public FileEntity save(FileEntity entity) {
        return fileRepository.save(entity);
    }

    public FileEntity rename(Long id, String name, Long userId) {
        FileEntity f = fileRepository.findById(id).orElseThrow();
        if (!f.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");
        f.setName(name);
        f.setUpdatedAt(LocalDateTime.now());
        return fileRepository.save(f);
    }

    //  Internal overload — used by scheduler (no ownership check)
    public void delete(Long id) throws IOException {
        FileEntity f = fileRepository.findById(id).orElseThrow();
        String fileName = f.getUrl().substring(f.getUrl().lastIndexOf("/") + 1);
        Path path = Paths.get("uploads/" + fileName);
        Files.deleteIfExists(path);
        fileRepository.delete(f);
    }

    //  Public API version — used by controller (checks ownership)
    public void delete(Long id, Long userId) throws IOException {
        FileEntity f = fileRepository.findById(id).orElseThrow();
        if (!f.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");
        String fileName = f.getUrl().substring(f.getUrl().lastIndexOf("/") + 1);
        Path path = Paths.get("uploads/" + fileName);
        Files.deleteIfExists(path);
        fileRepository.delete(f);
    }

    public FileEntity move(Long id, String folderId, Long userId) {
        FileEntity f = fileRepository.findById(id).orElseThrow();
        if (!f.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");
        f.setFolderId(folderId);
        f.setUpdatedAt(LocalDateTime.now());
        return fileRepository.save(f);
    }

    public List<List<Map<String, Object>>> getDuplicates(Long userId) {
        List<FileEntity> files = fileRepository.findByUserIdAndDeletedAtIsNull(userId);

        // Group by name + size
        Map<String, List<FileEntity>> grouped = files.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        f -> f.getName() + "_" + f.getSize()
                ));

        // Keep only groups with more than 1 file
        return grouped.values().stream()
                .filter(group -> group.size() > 1)
                .map(group -> group.stream()
                        .map(f -> Map.<String, Object>of(
                                "id",        f.getId(),
                                "name",      f.getName(),
                                "size",      f.getSize(),
                                "type",      f.getType() != null ? f.getType() : "other",
                                "url",       f.getUrl() != null ? f.getUrl() : "",
                                "folderId",  f.getFolderId() != null ? f.getFolderId() : "root",
                                "createdAt", f.getCreatedAt() != null ? f.getCreatedAt().toString() : "",
                                "updatedAt", f.getUpdatedAt() != null ? f.getUpdatedAt().toString() : ""
                        ))
                        .toList()
                )
                .toList();
    }

    public FileEntity copy(Long id, String folderId, Long userId) {
        FileEntity original = fileRepository.findById(id).orElseThrow();
        if (!original.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");
        FileEntity copy = new FileEntity();
        copy.setName(original.getName());
        copy.setType(original.getType());
        copy.setSize(original.getSize());
        copy.setUrl(original.getUrl());
        copy.setFolderId(folderId);
        copy.setUserId(userId);
        copy.setCreatedAt(LocalDateTime.now());
        copy.setUpdatedAt(LocalDateTime.now());
        return fileRepository.save(copy);
    }

    public FileEntity moveToTrash(Long id, Long userId) {
        FileEntity f = fileRepository.findById(id).orElseThrow();
        if (!f.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");
        f.setDeletedAt(LocalDateTime.now());
        return fileRepository.save(f);
    }

    public FileEntity restore(Long id, Long userId) {
        FileEntity f = fileRepository.findById(id).orElseThrow();
        if (!f.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");
        f.setDeletedAt(null);
        return fileRepository.save(f);
    }
}