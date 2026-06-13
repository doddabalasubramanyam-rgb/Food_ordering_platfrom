package com.foodzone.app.repository;

import com.foodzone.app.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCouponCode(String couponCode);
    
    // Find active promotions: validFrom <= current_time <= validTo
    List<Promotion> findByValidFromBeforeAndValidToAfter(LocalDateTime now1, LocalDateTime now2);
}
