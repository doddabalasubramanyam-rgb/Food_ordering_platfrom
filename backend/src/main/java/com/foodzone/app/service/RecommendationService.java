package com.foodzone.app.service;

import com.foodzone.app.entity.Order;
import com.foodzone.app.entity.OrderItem;
import com.foodzone.app.entity.Product;
import com.foodzone.app.entity.User;
import com.foodzone.app.repository.OrderRepository;
import com.foodzone.app.repository.ProductRepository;
import com.foodzone.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Product> getRecommendations() {
        List<Product> allActive = productRepository.findByIsAvailableTrue();
        if (allActive.size() <= 3) {
            return allActive;
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // Public recommendation: return most ordered or a default subset
            return getPopularRecommendations(allActive);
        }

        User user = userOpt.get();
        List<Order> customerOrders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());

        if (customerOrders.isEmpty()) {
            // Customer has no order history: return default popular items
            return getPopularRecommendations(allActive);
        }

        // Analyze category preferences from customer order history
        Map<String, Integer> categoryCounts = new HashMap<>();
        for (Order order : customerOrders) {
            for (OrderItem item : order.getItems()) {
                String cat = item.getProduct().getCategory();
                categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0) + item.getQuantity());
            }
        }

        // Sort categories by preference count
        List<String> preferredCategories = categoryCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Select items matching preferred categories first
        List<Product> recommendations = new ArrayList<>();
        for (String cat : preferredCategories) {
            for (Product p : allActive) {
                if (p.getCategory().equalsIgnoreCase(cat) && !recommendations.contains(p)) {
                    recommendations.add(p);
                }
            }
        }

        // Fill up to 4 items with remaining active products if needed
        for (Product p : allActive) {
            if (recommendations.size() >= 4) break;
            if (!recommendations.contains(p)) {
                recommendations.add(p);
            }
        }

        return recommendations.stream().limit(4).collect(Collectors.toList());
    }

    private List<Product> getPopularRecommendations(List<Product> activeProducts) {
        // Fallback: simple rule-based ranking (e.g. recommend items containing 'Pizza' or 'Combo' first, or alphabetical order)
        // Let's rank by category variety
        List<Product> defaultRecs = new ArrayList<>();
        Set<String> categoriesAdded = new HashSet<>();
        
        for (Product p : activeProducts) {
            if (!categoriesAdded.contains(p.getCategory())) {
                defaultRecs.add(p);
                categoriesAdded.add(p.getCategory());
            }
            if (defaultRecs.size() >= 4) break;
        }

        for (Product p : activeProducts) {
            if (defaultRecs.size() >= 4) break;
            if (!defaultRecs.contains(p)) {
                defaultRecs.add(p);
            }
        }

        return defaultRecs;
    }
}
