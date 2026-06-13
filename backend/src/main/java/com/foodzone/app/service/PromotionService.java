package com.foodzone.app.service;

import com.foodzone.app.entity.Promotion;
import com.foodzone.app.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    public List<Promotion> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findByValidFromBeforeAndValidToAfter(now, now);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Promotion createPromotion(Promotion promotion) {
        if (promotion.getValidFrom() == null) {
            promotion.setValidFrom(LocalDateTime.now());
        }
        if (promotion.getValidTo() == null) {
            promotion.setValidTo(LocalDateTime.now().plusDays(7)); // Default 1 week
        }
        if (promotionRepository.findByCouponCode(promotion.getCouponCode()).isPresent()) {
            throw new IllegalArgumentException("Promotion with this coupon code already exists!");
        }
        return promotionRepository.save(promotion);
    }
}
