package com.example.File_Management_System.controller;

import com.example.File_Management_System.model.FriendEntity;
import com.example.File_Management_System.model.UserEntity;
import com.example.File_Management_System.repository.FriendRepository;
import com.example.File_Management_System.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendRepository friendRepository;

    @Autowired
    private UserRepository userRepository;

    // ── Helper: map user to response ─────────────────────────
    private Map<String, Object> userMap(UserEntity u) {
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail());
    }

    // ── Get accepted friends (both directions) ────────────────
    @GetMapping("/{userId}")
    public ResponseEntity<?> getFriends(@PathVariable Long userId) {
        List<FriendEntity> links = friendRepository.findAcceptedFriends(userId);

        List<Map<String, Object>> result = links.stream()
                .map(f -> {
                    Long otherId = f.getUserId().equals(userId) ? f.getFriendId() : f.getUserId();
                    return userRepository.findById(otherId);
                })
                .filter(Optional::isPresent)
                .map(opt -> userMap(opt.get()))
                .collect(Collectors.toMap(
                        m -> (Long) m.get("id"),  // deduplicate by user id
                        m -> m,
                        (a, b) -> a               // keep first if duplicate
                ))
                .values()
                .stream()
                .toList();

        return ResponseEntity.ok(result);
    }

    // ── Get incoming pending requests ─────────────────────────
    @GetMapping("/{userId}/requests")
    public ResponseEntity<?> getRequests(@PathVariable Long userId) {
        List<FriendEntity> pending = friendRepository
                .findByFriendIdAndStatus(userId, FriendEntity.Status.PENDING);

        List<Map<String, Object>> result = pending.stream()
                .map(f -> userRepository.findById(f.getUserId()))
                .filter(Optional::isPresent)
                .map(opt -> {
                    UserEntity u = opt.get();
                    return Map.<String, Object>of(
                            "id", u.getId(),
                            "name", u.getName(),
                            "email", u.getEmail()
                    );
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    // ── Send friend request ───────────────────────────────────
    @PostMapping("/{userId}/add")
    public ResponseEntity<?> addFriend(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));

        Optional<UserEntity> meOpt = userRepository.findById(userId);
        if (meOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        UserEntity me = meOpt.get();
        if (me.getEmail().equalsIgnoreCase(email.trim()))
            return ResponseEntity.badRequest().body(Map.of("error", "You can't add yourself"));

        Optional<UserEntity> foundOpt = userRepository.findByEmail(email.trim());
        if (foundOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "No user found with email: " + email));

        UserEntity friendUser = foundOpt.get();

        // Check if any relationship already exists in either direction
        Optional<FriendEntity> existing = friendRepository.findBetween(userId, friendUser.getId());
        if (existing.isPresent()) {
            FriendEntity.Status status = existing.get().getStatus();
            if (status == FriendEntity.Status.ACCEPTED)
                return ResponseEntity.badRequest().body(Map.of("error", "Already friends"));
            if (status == FriendEntity.Status.PENDING)
                return ResponseEntity.badRequest().body(Map.of("error", "Friend request already sent"));
        }

        FriendEntity link = new FriendEntity();
        link.setUserId(userId);
        link.setFriendId(friendUser.getId());
        link.setStatus(FriendEntity.Status.PENDING);
        friendRepository.save(link);

        return ResponseEntity.ok(Map.of("message", "Friend request sent to " + friendUser.getName()));
    }

    // ── Accept friend request ─────────────────────────────────
    @PutMapping("/{userId}/accept/{fromUserId}")
    public ResponseEntity<?> acceptRequest(
            @PathVariable Long userId,
            @PathVariable Long fromUserId) {

        // The request was sent by fromUserId TO userId
        Optional<FriendEntity> linkOpt = friendRepository.findBetween(fromUserId, userId);
        if (linkOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Request not found"));

        FriendEntity link = linkOpt.get();
        link.setStatus(FriendEntity.Status.ACCEPTED);
        friendRepository.save(link);

        return ResponseEntity.ok(Map.of("message", "Friend request accepted"));
    }

    @GetMapping("/{userId}/sent")
    public ResponseEntity<?> getSentRequests(@PathVariable Long userId) {
        List<FriendEntity> pending = friendRepository
                .findByUserIdAndStatus(userId, FriendEntity.Status.PENDING);

        List<Map<String, Object>> result = pending.stream()
                .map(f -> userRepository.findById(f.getFriendId()))
                .filter(Optional::isPresent)
                .map(opt -> userMap(opt.get()))
                .toList();

        return ResponseEntity.ok(result);
    }


    // ── Decline friend request ────────────────────────────────
    @PutMapping("/{userId}/decline/{fromUserId}")
    public ResponseEntity<?> declineRequest(
            @PathVariable Long userId,
            @PathVariable Long fromUserId) {

        Optional<FriendEntity> linkOpt = friendRepository.findBetween(fromUserId, userId);
        if (linkOpt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Request not found"));

        friendRepository.delete(linkOpt.get());
        return ResponseEntity.ok(Map.of("message", "Request declined"));
    }

    // ── Remove friend ─────────────────────────────────────────
    @DeleteMapping("/{userId}/remove/{friendId}")
    @Transactional
    public ResponseEntity<?> removeFriend(
            @PathVariable Long userId,
            @PathVariable Long friendId) {

        Optional<FriendEntity> linkOpt = friendRepository.findBetween(userId, friendId);
        linkOpt.ifPresent(friendRepository::delete);
        return ResponseEntity.ok(Map.of("message", "Removed"));
    }
}