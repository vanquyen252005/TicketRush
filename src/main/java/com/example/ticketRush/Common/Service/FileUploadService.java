package com.example.ticketRush.Common.Service;

import com.example.ticketRush.Common.Storage.StorageException;
import com.example.ticketRush.Common.Storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

//import java.IOException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
//import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

// @Service("legacyFileUploadService")
public class FileUploadService {

    private final StorageService storageService;

    @Autowired
    public FileUploadService(StorageService storageService) {
        this.storageService = storageService;
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new StorageException("Failed to store empty file.");
        }

        try {
            // Normalize file name
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new StorageException("Invalid file name.");
            }
            String fileExtension = getFileExtension(originalFilename)
                    .orElse("");

            // Generate unique filename
            String filename = UUID.randomUUID().toString() + fileExtension;

            Path destinationFile = storageService.load(filename);
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            // Return the public URL path
            return "/uploads/" + filename;

        } catch (IOException e) {
            throw new StorageException("Failed to store file.", e);
        }
    }

    private java.util.Optional<String> getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return Optional.of(filename.substring(dotIndex));
        }
        return Optional.empty();
    }
}
