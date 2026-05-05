package com.example.File_Management_System.controller;

import com.example.File_Management_System.model.FavoriteEntity;
import com.example.File_Management_System.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    // Get all favorite item IDs
    @GetMapping
    public List<String> getFavorites() {
        return favoriteRepository.findAll()
                .stream()
                .map(FavoriteEntity::getItemId)
                .toList();
    }

    // Add favorite
    @PostMapping
    public void addFavorite(@RequestBody Map<String, String> body) {
        String itemId = body.get("itemId");
        // avoid duplicates
        if (favoriteRepository.findByItemId(itemId).isEmpty()) {
            FavoriteEntity fav = new FavoriteEntity();
            fav.setItemId(itemId);
            fav.setItemType(body.get("itemType"));
            favoriteRepository.save(fav);
        }
    }

    // Remove favorite
    @DeleteMapping("/{itemId}")
    public void removeFavorite(@PathVariable String itemId) {
        favoriteRepository.deleteByItemId(itemId);
    }
}