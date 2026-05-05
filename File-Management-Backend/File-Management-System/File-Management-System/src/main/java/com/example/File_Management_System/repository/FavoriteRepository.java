package com.example.File_Management_System.repository;

import com.example.File_Management_System.model.FavoriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<FavoriteEntity, Long> {
    List<FavoriteEntity> findAll();
    Optional<FavoriteEntity> findByItemId(String itemId);

    @Transactional  // ✅ required for delete by non-primary-key field
    void deleteByItemId(String itemId);
}