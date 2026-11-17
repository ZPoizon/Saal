package br.org.saal.api.photo;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload administrativo de fotografias. A rota esta sob {@code /api/v1/admin/**} e
 * portanto exige ROLE_ADMIN e CSRF nas mutacoes, garantidos pelo filtro de seguranca.
 */
@RestController
@RequestMapping("/api/v1/admin/photos")
public class AdminPhotoController {
    private final PhotoStorageService service;

    public AdminPhotoController(PhotoStorageService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoUploadResponse> upload(
            @RequestParam("photos") List<MultipartFile> photos) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new PhotoUploadResponse(service.store(photos)));
    }
}
