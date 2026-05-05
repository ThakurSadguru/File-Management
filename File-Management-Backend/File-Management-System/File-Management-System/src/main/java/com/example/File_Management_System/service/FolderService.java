package com.example.File_Management_System.service;

import com.example.File_Management_System.model.FolderEntity;
import com.example.File_Management_System.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FolderService {

    @Autowired
    private FolderRepository folderRepository;

    public FolderEntity save(FolderEntity folder) {
        return folderRepository.save(folder);
    }

    public List<FolderEntity> getByParentId(String parentId, Long userId) {  // ✅
        return folderRepository.findByParentIdAndUserId(parentId, userId);
    }

    public List<FolderEntity> getAll(Long userId) {  // ✅
        return folderRepository.findByUserId(userId);
    }

    public FolderEntity rename(String id, String newName, Long userId) {  // ✅
        FolderEntity folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found: " + id));
        if (!folder.getUserId().equals(userId))
            throw new RuntimeException("Unauthorized");
        folder.setName(newName);
        return folderRepository.save(folder);
    }

    public void delete(String id, Long userId) {  // ✅
        FolderEntity folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found: " + id));
        if (!folder.getUserId().equals(userId))
            throw new RuntimeException("Unauthorized");
        // Recursively delete children
        List<FolderEntity> children = folderRepository.findByParentIdAndUserId(id, userId);
        for (FolderEntity child : children) {
            delete(child.getId(), userId);
        }
        folderRepository.deleteById(id);
    }

    public FolderEntity move(String id, String newParentId, Long userId) {  // ✅
        FolderEntity folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found: " + id));
        if (!folder.getUserId().equals(userId))
            throw new RuntimeException("Unauthorized");
        folder.setParentId(newParentId);
        return folderRepository.save(folder);
    }
}