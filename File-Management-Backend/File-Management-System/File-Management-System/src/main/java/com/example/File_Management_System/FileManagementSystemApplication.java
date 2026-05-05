package com.example.File_Management_System;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FileManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(FileManagementSystemApplication.class, args);
	}

}
