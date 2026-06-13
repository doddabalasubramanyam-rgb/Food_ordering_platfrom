package com.foodzone.app.service;

import com.foodzone.app.dto.OrderItemRequest;
import com.foodzone.app.dto.OrderRequest;
import com.foodzone.app.entity.*;
import com.foodzone.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public Order placeOrder(OrderRequest request) {
        User customer = getLoggedInUser();
        
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty!");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.getProductId()));

            if (!product.getIsAvailable() || product.getStockQty() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock or product unavailable: " + product.getName() 
                        + " (Requested: " + itemReq.getQuantity() + ", Stock: " + product.getStockQty() + ")");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);

        // Apply promotion coupon if provided
        BigDecimal total = subtotal;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Promotion> promoOpt = promotionRepository.findByCouponCode(request.getCouponCode().trim());
            if (promoOpt.isPresent()) {
                Promotion promo = promoOpt.get();
                LocalDateTime now = LocalDateTime.now();
                if (now.isAfter(promo.getValidFrom()) && now.isBefore(promo.getValidTo())) {
                    BigDecimal discountFactor = promo.getDiscountPct().divide(BigDecimal.valueOf(100));
                    BigDecimal discountAmount = subtotal.multiply(discountFactor);
                    total = subtotal.subtract(discountAmount);
                } else {
                    throw new IllegalArgumentException("Coupon code has expired or is not yet active!");
                }
            } else {
                throw new IllegalArgumentException("Invalid coupon code!");
            }
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        // Notify customer via email and in-app
        String custMsg = "order is placed successfully. Your order #" + savedOrder.getId() + " was placed successfully. Total: ₹" + total + ". Please complete payment within 10 minutes.";
        emailService.sendEmail(customer.getEmail(), 
                "Order Placed Successfully - #" + savedOrder.getId(),
                custMsg);
        notificationService.createNotification(customer, custMsg);

        // Notify suppliers via email and in-app
        for (OrderItem item : savedOrder.getItems()) {
            User supplier = item.getProduct().getSupplier();
            String suppMsg = "new order. New pending order #" + savedOrder.getId() + " contains your product: " + item.getProduct().getName() + " (Qty: " + item.getQuantity() + ").";
            emailService.sendEmail(supplier.getEmail(), 
                    "New Pending Order - #" + savedOrder.getId(),
                    suppMsg);
            notificationService.createNotification(supplier, suppMsg);
        }

        return savedOrder;
    }

    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        User user = getLoggedInUser();
        if (!order.getCustomer().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to cancel this order!");
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Order can only be cancelled while pending payment!");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        // Notify customer via email and in-app
        String custMsg = "Your order #" + order.getId() + " has been cancelled.";
        emailService.sendEmail(order.getCustomer().getEmail(), 
                "Order Cancelled - #" + order.getId(),
                custMsg);
        notificationService.createNotification(order.getCustomer(), custMsg);

        // Notify suppliers via email and in-app
        for (OrderItem item : savedOrder.getItems()) {
            User supplier = item.getProduct().getSupplier();
            String suppMsg = "Order #" + order.getId() + " has been cancelled by the customer.";
            emailService.sendEmail(supplier.getEmail(), 
                    "Order Cancelled - #" + order.getId(),
                    suppMsg);
            notificationService.createNotification(supplier, suppMsg);
        }

        return savedOrder;
    }

    public List<Order> getCustomerOrders() {
        User customer = getLoggedInUser();
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId());
    }

    public List<Order> getSupplierOrderQueue(String dateString) {
        User supplier = getLoggedInUser();
        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();
        
        // Filter orders containing products belonging to this supplier
        List<Order> supplierOrders = allOrders.stream()
                .filter(order -> order.getItems().stream()
                        .anyMatch(item -> item.getProduct().getSupplier().getId().equals(supplier.getId())))
                .collect(Collectors.toList());

        // Apply day filtering if specified
        if (dateString != null && !dateString.trim().isEmpty()) {
            try {
                LocalDate filterDate = LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
                supplierOrders = supplierOrders.stream()
                        .filter(order -> order.getCreatedAt().toLocalDate().equals(filterDate))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
            }
        }

        return supplierOrders;
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        User supplier = getLoggedInUser();
        boolean ownsProduct = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getSupplier().getId().equals(supplier.getId()));

        if (!ownsProduct) {
            throw new IllegalStateException("You are not authorized to update this order's status!");
        }

        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);

        // Notify customer via email and in-app
        String customerMsg = "Your order #" + order.getId() + " status is now: " + status;
        if (status == OrderStatus.PREPARING) {
            customerMsg = "Your order #" + order.getId() + " is now being prepared in the kitchen!";
        } else if (status == OrderStatus.READY) {
            customerMsg = "Your order #" + order.getId() + " is ready for pickup or delivery!";
        } else if (status == OrderStatus.DELIVERED) {
            customerMsg = "Your order #" + order.getId() + " has been successfully delivered. Thank you!";
        }
        emailService.sendEmail(order.getCustomer().getEmail(), 
                "Order Status Update - #" + order.getId(), 
                customerMsg);
        notificationService.createNotification(order.getCustomer(), customerMsg);

        // Notify other suppliers of status changes via email and in-app
        for (OrderItem item : savedOrder.getItems()) {
            User s = item.getProduct().getSupplier();
            if (!s.getId().equals(supplier.getId())) {
                String suppMsg = "Order #" + order.getId() + " status has been updated to: " + status + " by another supplier.";
                emailService.sendEmail(s.getEmail(), 
                        "Order Status Changed - #" + order.getId(), 
                        suppMsg);
                notificationService.createNotification(s, suppMsg);
            }
        }

        return savedOrder;
    }

    public Order reorder(Long orderId) {
        Order oldOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        User customer = getLoggedInUser();
        if (!oldOrder.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("You cannot re-order from another customer's history!");
        }

        // Create new checkout request
        OrderRequest request = new OrderRequest();
        List<OrderItemRequest> itemReqs = new ArrayList<>();
        for (OrderItem item : oldOrder.getItems()) {
            OrderItemRequest req = new OrderItemRequest();
            req.setProductId(item.getProduct().getId());
            req.setQuantity(item.getQuantity());
            itemReqs.add(req);
        }
        request.setItems(itemReqs);
        // By default, do not carry over the coupon unless the user specifies it, or let's try to check if there is a way
        return placeOrder(request);
    }
}
