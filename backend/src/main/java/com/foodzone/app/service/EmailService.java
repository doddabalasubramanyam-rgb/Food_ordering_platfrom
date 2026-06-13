package com.foodzone.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String toEmail, String subject, String body) {
        log.info("Attempting to send email to {}", toEmail);
        boolean sentSuccessfully = false;

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Email dispatched successfully to {}", toEmail);
                sentSuccessfully = true;
            } catch (Exception e) {
                log.warn("SMTP email dispatch to {} failed: {}. Falling back to console log representation.", 
                        toEmail, e.getMessage());
            }
        } else {
            log.warn("JavaMailSender is not configured. Falling back to console log representation.");
        }

        if (!sentSuccessfully) {
            log.info("====================================================================");
            log.info("LOG-BASED EMAIL CORRESPONDENCE");
            log.info("To: {}", toEmail);
            log.info("Subject: {}", subject);
            log.info("Body:");
            log.info("\n{}", body);
            log.info("====================================================================");
        }
    }
}
