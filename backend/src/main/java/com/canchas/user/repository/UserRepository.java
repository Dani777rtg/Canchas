package com.canchas.user.repository;

import com.canchas.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
            select u from User u
            where (:email is null or lower(u.email) like lower(concat('%', :email, '%')))
            """)
    Page<User> searchByEmailOptional(@Param("email") String email, Pageable pageable);
}
