package br.org.saal.api.photo;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class PhotoStorageServiceTest {
    @Test
    void detectaFormatoSomentePelosBytesReais() {
        assertEquals("image/jpeg", PhotoStorageService.detectContentType(new byte[] {
                (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0
        }));
        assertEquals("image/png", PhotoStorageService.detectContentType(new byte[] {
                (byte) 0x89, 'P', 'N', 'G', (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A
        }));
        assertEquals("image/webp", PhotoStorageService.detectContentType(new byte[] {
                'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'
        }));
        assertNull(PhotoStorageService.detectContentType(
                "<svg onload=alert(1)>".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void extraiIdSomenteDeUrlInternaDeFoto() {
        assertEquals(42L, PhotoStorageService.storedPhotoId("/api/v1/photos/42"));
        assertNull(PhotoStorageService.storedPhotoId("/api/v1/photos/42?w=100"));
        assertNull(PhotoStorageService.storedPhotoId("https://example.test/foto.jpg"));
        assertNull(PhotoStorageService.storedPhotoId("/api/v1/photos/abc"));
        assertNull(PhotoStorageService.storedPhotoId("/api/v1/photos/0"));
    }
}
