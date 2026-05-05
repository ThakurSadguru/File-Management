package com.example.File_Management_System.controller;

import com.example.File_Management_System.model.FolderEntity;
import com.example.File_Management_System.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @PostMapping
    public FolderEntity create(@RequestBody FolderEntity folder) {
        // userId must be set in the request body from frontend
        return folderService.save(folder);
    }

    @GetMapping("/{parentId}")
    public List<FolderEntity> getByParent(@PathVariable String parentId,
                                          @RequestParam Long userId) {
        return folderService.getByParentId(parentId, userId);
    }

    @GetMapping("/all")
    public List<FolderEntity> getAllFolders(@RequestParam Long userId) {
        return folderService.getAll(userId);
    }

    @PutMapping("/{id}/rename")
    public FolderEntity renameFolder(@PathVariable String id,
                                     @RequestBody Map<String, String> body) {
        return folderService.rename(id, body.get("name"),
                Long.valueOf(body.get("userId")));  // ✅
    }

    @DeleteMapping("/{id}")
    public void deleteFolder(@PathVariable String id,
                             @RequestParam Long userId) {  // ✅
        folderService.delete(id, userId);
    }

    @PutMapping("/{id}/move")
    public FolderEntity moveFolder(@PathVariable String id,
                                   @RequestBody Map<String, String> body) {
        return folderService.move(id, body.get("parentId"),
                Long.valueOf(body.get("userId")));
    }
}