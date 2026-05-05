package com.example.File_Management_System.repository;

import com.example.File_Management_System.model.SharedFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SharedFileRepository extends JpaRepository<SharedFileEntity, Long> {
    List<SharedFileEntity> findByFromUserId(Long fromUserId);
    List<SharedFileEntity> findByToUserId(Long toUserId);
    void deleteById(Long id);
}