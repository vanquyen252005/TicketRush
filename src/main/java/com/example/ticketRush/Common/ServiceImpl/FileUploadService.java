package com.example.ticketRush.Common.ServiceImpl;

import com.example.ticketRush.Common.Storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service    
public class FileUploadService {

    @Autowired
    private StorageService storageService;

    public String uploadFile(MultipartFile file) {
        String fileName = storageService.store(file);
        return fileName;
    }

    public String uploadFromUrl(String imageUrl) {
        String fileName = storageService.storeFromUrl(imageUrl);
        return fileName;
    }
}
