package com.foodzone.app.repository;

import com.foodzone.app.entity.Order;
import com.foodzone.app.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    
    // For Supplier view: pending order queue and all orders placed
    List<Order> findByStatusInOrderByCreatedAtDesc(List<OrderStatus> statuses);
    
    List<Order> findAllByOrderByCreatedAtDesc();
    
    // For scheduler: find orders that are pending payment and older than 10 minutes
    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime dateTime);
}
