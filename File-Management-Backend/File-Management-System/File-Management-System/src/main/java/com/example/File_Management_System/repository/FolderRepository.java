package com.example.File_Management_System.repository;

import com.example.File_Management_System.model.FolderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FolderRepository extends JpaRepository<FolderEntity, String> {

    List<FolderEntity> findByParentId(String parentId); // keep for recursive internal use

    List<FolderEntity> findByParentIdAndUserId(String parentId, Long userId);  // ✅

    List<FolderEntity> findByUserId(Long userId);  // ✅
}
