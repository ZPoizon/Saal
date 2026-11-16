package br.org.saal.api.photo;

import java.time.Duration;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Leitura publica das fotografias persistidas. O identificador e imutavel, por isso a
 * resposta pode ser cacheada por um ano. Parametros de imagem na URL sao ignorados.
 */
@RestController
@RequestMapping("/api/v1/photos")
public class PublicPhotoController {
    private final PhotoStorageService service;

    public PublicPhotoController(PhotoStorageService service) {
        this.service = service;
    }

    @GetMapping("/{photoId}")
    public ResponseEntity<byte[]> get(@PathVariable String photoId) {
        StoredPhotoEntity photo = service.requirePhoto(photoId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.getContentType()))
                .contentLength(photo.getByteSize())
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .header("X-Content-Type-Options", "nosniff")
                .body(photo.getData());
    }
}
