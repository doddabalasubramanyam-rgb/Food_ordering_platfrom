package com.foodzone.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FoodZoneApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodZoneApplication.class, args);
    }
}
