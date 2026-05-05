package com.example.File_Management_System.repository;

import com.example.File_Management_System.model.FriendEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<FriendEntity, Long> {

    // All accepted friendships where user is either sender or receiver
    @Query("SELECT f FROM FriendEntity f WHERE f.status = 'ACCEPTED' AND (f.userId = :uid OR f.friendId = :uid)")
    List<FriendEntity> findAcceptedFriends(@Param("uid") Long userId);

    // Incoming pending requests (someone sent a request TO this user)
    List<FriendEntity> findByFriendIdAndStatus(Long friendId, FriendEntity.Status status);

    // Outgoing pending requests (this user sent a request to someone)
    List<FriendEntity> findByUserIdAndStatus(Long userId, FriendEntity.Status status);

    // Find a specific friendship record in either direction
    @Query("SELECT f FROM FriendEntity f WHERE (f.userId = :a AND f.friendId = :b) OR (f.userId = :b AND f.friendId = :a)")
    Optional<FriendEntity> findBetween(@Param("a") Long a, @Param("b") Long b);

    void deleteByUserIdAndFriendId(Long userId, Long friendId);

    boolean existsByUserIdAndFriendId(Long userId, Long friendId);
}