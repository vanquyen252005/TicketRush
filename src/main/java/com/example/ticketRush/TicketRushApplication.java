package com.example.ticketRush;

import com.example.ticketRush.Common.Storage.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class 	TicketRushApplication {

	public static void main(String[] args) {
		SpringApplication.run(TicketRushApplication.class, args);
	}

}
