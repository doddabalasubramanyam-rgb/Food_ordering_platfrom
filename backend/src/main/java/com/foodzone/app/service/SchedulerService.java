package com.foodzone.app.service;

import com.foodzone.app.entity.*;
import com.foodzone.app.repository.OrderRepository;
import com.foodzone.app.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SchedulerService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    // Run every minute (60,000 milliseconds)
    @Scheduled(fixedRate = 60000)
    public void runAutoCancelTasks() {
        log.info("Starting background cleanup for expired orders and payments...");
        LocalDateTime now = LocalDateTime.now();

        // 1. Expire Payment Sessions (2-minute window)
        LocalDateTime paymentTimeout = now.minusMinutes(2);
        List<Payment> expiredPayments = paymentRepository.findByStatusAndCreatedAtBefore(PaymentStatus.PENDING, paymentTimeout);
        for (Payment payment : expiredPayments) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);

                log.info("Payment session expired for Order #{}. Marked payment as FAILED and order as CANCELLED.", order.getId());

                // Notify Customer via email and in-app
                String custMsg = "Your payment session for order #" + order.getId() + " has expired. The order has been cancelled.";
                emailService.sendEmail(order.getCustomer().getEmail(), 
                        "Payment Session Expired - #" + order.getId(),
                        custMsg);
                notificationService.createNotification(order.getCustomer(), custMsg);

                // Notify Suppliers via email and in-app
                for (OrderItem item : order.getItems()) {
                    User supplier = item.getProduct().getSupplier();
                    String suppMsg = "Payment session expired for Order #" + order.getId() + ". The order has been cancelled.";
                    emailService.sendEmail(supplier.getEmail(), 
                            "Payment Session Expired - #" + order.getId(),
                            suppMsg);
                    notificationService.createNotification(supplier, suppMsg);
                }
            }
        }

        // 2. Cancel Unpaid Orders (10-minute window)
        LocalDateTime orderTimeout = now.minusMinutes(10);
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING_PAYMENT, orderTimeout);
        for (Order order : expiredOrders) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            log.info("Order #{} has been auto-cancelled due to payment timeout (10 minutes).", order.getId());

            // Notify Customer via email and in-app
            String custMsg = "Your order #" + order.getId() + " has been auto-cancelled because payment was not completed within 10 minutes.";
            emailService.sendEmail(order.getCustomer().getEmail(), 
                    "Order Cancelled (Timeout) - #" + order.getId(),
                    custMsg);
            notificationService.createNotification(order.getCustomer(), custMsg);

            // Notify Suppliers via email and in-app
            for (OrderItem item : order.getItems()) {
                User supplier = item.getProduct().getSupplier();
                String suppMsg = "Order #" + order.getId() + " has been auto-cancelled due to payment timeout (10 minutes).";
                emailService.sendEmail(supplier.getEmail(), 
                        "Order Cancelled (Timeout) - #" + order.getId(),
                        suppMsg);
                notificationService.createNotification(supplier, suppMsg);
            }
        }
    }
}
