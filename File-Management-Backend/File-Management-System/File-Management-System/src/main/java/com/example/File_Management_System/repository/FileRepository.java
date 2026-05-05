package com.example.File_Management_System.repository;

import com.example.File_Management_System.model.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FileRepository extends JpaRepository<FileEntity, Long> {

    List<FileEntity> findByFolderIdAndUserIdAndDeletedAtIsNull(String folderId, Long userId);

    List<FileEntity> findByUserIdAndDeletedAtIsNull(Long userId);

    List<FileEntity> findByUserIdAndDeletedAtIsNotNull(Long userId);  // trash

    @Query("SELECT COALESCE(SUM(f.size), 0) FROM FileEntity f WHERE f.userId = :userId AND f.deletedAt IS NULL")
    Long sumSizeByUserId(@Param("userId") Long userId);
}
