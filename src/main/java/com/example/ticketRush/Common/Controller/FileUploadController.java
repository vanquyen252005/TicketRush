package com.example.ticketRush.Common.Controller;

//import com.example.ticketRush.Common.Service.FileUploadService;
import com.example.ticketRush.Common.ServiceImpl.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

// String url = ServletUriComponentsBuilder.fromCurrentContextPath()
//         .path(fileName)
//         .toUriString();

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload một file ảnh và trả về URL công khai.
     * POST /api/upload/image
     * Content-Type: multipart/form-data
     * field name: "file"
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        String fileName = fileUploadService.uploadFile(file);
        // Build absolute URL (e.g., http://localhost:8082/uploads/<fileName>)
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();
        return ResponseEntity.ok(Map.of("url", url));
    }
}
