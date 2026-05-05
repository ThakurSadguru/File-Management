package com.example.File_Management_System.controller;

import com.example.File_Management_System.model.FileEntity;
import com.example.File_Management_System.service.FileService;
import com.example.File_Management_System.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired private FileService fileService;
    @Autowired private FolderService folderService;

    @GetMapping("/folder/{folderId}")
    public List<FileEntity> getFiles(@PathVariable String folderId,
                                     @RequestParam Long userId) {
        return fileService.getByFolder(folderId, userId);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats(@RequestParam Long userId) {
        return Map.of(
                "totalFiles",   fileService.getAll(userId).size(),
                "totalFolders", folderService.getAll(userId).size(),
                "usedBytes",    fileService.getTotalSize(userId)
        );
    }

    @GetMapping("/all/{folderId}")
    public Map<String, Object> getAll(@PathVariable String folderId,
                                      @RequestParam Long userId) {
        return Map.of(
                "folders", folderService.getByParentId(folderId, userId),
                "files",   fileService.getByFolder(folderId, userId)
        );
    }

    @GetMapping("/all")
    public List<FileEntity> getAllFiles(@RequestParam Long userId) {
        return fileService.getAll(userId);
    }


    @GetMapping("/view/{fileName}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) throws IOException {
        // ✅ Use absolute path from working directory
        Path path = Paths.get(System.getProperty("user.dir"), "uploads", fileName);

        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(path.toUri());

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .body(resource);
    }

    @GetMapping("/duplicates")
    public List<List<Map<String, Object>>> getDuplicates(@RequestParam Long userId) {
        return fileService.getDuplicates(userId);
    }


    @PostMapping("/upload")
    public FileEntity upload(@RequestParam("file") MultipartFile file,
                             @RequestParam("folderId") String folderId,
                             @RequestParam("userId") Long userId) throws IOException {

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
        Files.copy(file.getInputStream(), uploadDir.resolve(fileName));

        FileEntity entity = new FileEntity();
        entity.setName(file.getOriginalFilename());
        entity.setUserId(userId);  // ✅ set owner

        String contentType = file.getContentType();
        String type = "other";
        if (contentType != null) {
            if (contentType.startsWith("image")) type = "image";
            else if (contentType.startsWith("video")) type = "video";
            else if (contentType.contains("pdf")) type = "pdf";
            else if (contentType.contains("text")) type = "text";
            else type = "document";
        }
        entity.setType(type);
        entity.setSize(file.getSize());
        entity.setUrl("http://localhost:8080/api/files/view/" + fileName);
        entity.setFolderId(folderId != null ? folderId : "root");
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return fileService.save(entity);
    }

    @PutMapping("/{id}/rename")
    public FileEntity renameFile(@PathVariable Long id,
                                 @RequestBody Map<String, String> body) {
        return fileService.rename(id, body.get("name"), Long.valueOf(body.get("userId")));
    }

    @DeleteMapping("/{id}")
    public void deleteFile(@PathVariable Long id,
                           @RequestParam Long userId) throws IOException {
        fileService.delete(id, userId);
    }

    @PutMapping("/{id}/move")
    public FileEntity moveFile(@PathVariable Long id,
                               @RequestBody Map<String, String> body) {
        return fileService.move(id, body.get("folderId"), Long.valueOf(body.get("userId")));
    }

    @PostMapping("/{id}/copy")
    public FileEntity copyFile(@PathVariable Long id,
                               @RequestBody Map<String, String> body) {
        return fileService.copy(id, body.get("folderId"), Long.valueOf(body.get("userId")));
    }

    @GetMapping("/trash")
    public List<FileEntity> getTrash(@RequestParam Long userId) {
        return fileService.getTrash(userId);
    }

    @PutMapping("/{id}/trash")
    public FileEntity moveToTrash(@PathVariable Long id,
                                  @RequestParam Long userId) {
        return fileService.moveToTrash(id, userId);
    }

    @PutMapping("/{id}/restore")
    public FileEntity restore(@PathVariable Long id,
                              @RequestParam Long userId) {
        return fileService.restore(id, userId);
    }

    @DeleteMapping("/{id}/permanent")
    public void deletePermanent(@PathVariable Long id,
                                @RequestParam Long userId) throws IOException {
        fileService.delete(id, userId);
    }
}