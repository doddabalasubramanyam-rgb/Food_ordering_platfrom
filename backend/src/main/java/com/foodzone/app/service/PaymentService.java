package com.foodzone.app.service;

import com.foodzone.app.entity.*;
import com.foodzone.app.repository.OrderRepository;
import com.foodzone.app.repository.PaymentRepository;
import com.foodzone.app.repository.ProductRepository;
import com.foodzone.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public Payment initiatePayment(Long orderId) {
        User customer = getLoggedInUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("You cannot pay for another customer's order!");
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Order is not in PENDING_PAYMENT status!");
        }

        // Generate dummy UPI QR code string
        String qrCode = "upi://pay?pa=abc-foodzone@paytm&pn=ABCFoodZone&am=" + order.getTotalAmount() 
                + "&tr=ORDER" + order.getId() + "&cu=INR";

        Optional<Payment> existingOpt = paymentRepository.findByOrderId(orderId);
        Payment payment;
        if (existingOpt.isPresent()) {
            payment = existingOpt.get();
            payment.setQrCode(qrCode);
            payment.setAmount(order.getTotalAmount());
            payment.setStatus(PaymentStatus.PENDING);
            payment.setCreatedAt(LocalDateTime.now()); // reset the 2 minute timer
            payment.setConfirmedAt(null);
        } else {
            payment = new Payment();
            payment.setOrder(order);
            payment.setQrCode(qrCode);
            payment.setAmount(order.getTotalAmount());
            payment.setStatus(PaymentStatus.PENDING);
            payment.setCreatedAt(LocalDateTime.now());
        }

        try {
            return paymentRepository.save(payment);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            Payment existingPayment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> e);
            existingPayment.setQrCode(qrCode);
            existingPayment.setAmount(order.getTotalAmount());
            existingPayment.setStatus(PaymentStatus.PENDING);
            existingPayment.setCreatedAt(LocalDateTime.now());
            existingPayment.setConfirmedAt(null);
            return paymentRepository.save(existingPayment);
        }
    }

    public Payment confirmPayment(Long orderId) {
        User customer = getLoggedInUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("You cannot confirm payment for another customer's order!");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("No payment session initiated for order: " + orderId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment is already " + payment.getStatus());
        }

        // Validate 2-minute payment timeout
        if (payment.getCreatedAt().plusMinutes(2).isBefore(LocalDateTime.now())) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            // Notify user of expiry via email and in-app
            String failMsg = "Payment for order #" + order.getId() + " is cancelled because the 2-minute payment window expired.";
            emailService.sendEmail(customer.getEmail(), 
                    "Payment Failed - #" + order.getId(), 
                    failMsg);
            notificationService.createNotification(customer, failMsg);
            
            throw new IllegalStateException("Payment window (2 minutes) has expired! Order cancelled.");
        }

        // Successful Payment Flow
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setConfirmedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Deduct Inventory Stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product.getStockQty() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName() 
                        + " (Available: " + product.getStockQty() + ", Required: " + item.getQuantity() + ")");
            }
            product.setStockQty(product.getStockQty() - item.getQuantity());
            if (product.getStockQty() == 0) {
                product.setIsAvailable(false);
            }
            productRepository.save(product);

            // Low Stock Warning Threshold (25% of initial stock) via email and in-app
            int initialStock = product.getInitialStockQty() != null ? product.getInitialStockQty() : 10;
            if (initialStock > 0 && product.getStockQty() < (0.25 * initialStock)) {
                String lowStockMsg = "particular product is very loww. Product '" + product.getName() + "' is very loww. Current Stock: " + product.getStockQty() + ".";
                emailService.sendEmail(product.getSupplier().getEmail(), 
                        "Low Stock Warning - " + product.getName(), 
                        lowStockMsg);
                notificationService.createNotification(product.getSupplier(), lowStockMsg);
            }
        }

        // Create email and in-app notifications
        String custSuccessMsg = "Payment is done. Your order #" + order.getId() + " is now confirmed and sent to preparation.";
        emailService.sendEmail(customer.getEmail(), 
                "Payment Received - #" + order.getId(), 
                custSuccessMsg);
        notificationService.createNotification(customer, custSuccessMsg);

        for (OrderItem item : order.getItems()) {
            User supplier = item.getProduct().getSupplier();
            String suppSuccessMsg = "Payment confirmed for order #" + order.getId() + ". Please prepare: " + item.getProduct().getName() + " (Qty: " + item.getQuantity() + ").";
            emailService.sendEmail(supplier.getEmail(), 
                    "Order Paid & Confirmed - #" + order.getId(), 
                    suppSuccessMsg);
            notificationService.createNotification(supplier, suppSuccessMsg);
        }

        return payment;
    }
}
