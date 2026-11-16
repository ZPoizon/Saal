package br.org.saal.api.photo;

import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.org.saal.api.animal.AnimalRepository;

/**
 * Armazena fotografias no proprio MySQL e devolve a URL publica imutavel usada em
 * {@code animal_photo.url}. A validacao de formato usa os bytes reais (magic bytes),
 * nao o {@code Content-Type} declarado pelo navegador.
 */
@Service
public class PhotoStorageService {
    /** Limite tecnico provisorio alinhado ao cliente (ONG-06 continua pendente). */
    public static final int MAX_PHOTO_BYTES = 5 * 1024 * 1024;
    public static final int MAX_PHOTOS_PER_UPLOAD = 3;

    static final String PUBLIC_PATH = "/api/v1/photos/";
    /** Uploads que nao foram associados a um animal sao descartados depois deste prazo. */
    static final Duration ORPHAN_RETENTION = Duration.ofHours(24);

    private final StoredPhotoRepository repository;
    private final AnimalRepository animalRepository;

    public PhotoStorageService(
            StoredPhotoRepository repository,
            AnimalRepository animalRepository) {
        this.repository = repository;
        this.animalRepository = animalRepository;
    }

    @Transactional
    public List<String> store(List<MultipartFile> files) {
        if (files == null || files.isEmpty() || files.size() > MAX_PHOTOS_PER_UPLOAD) {
            throw new InvalidPhotoException();
        }

        List<String> urls = new ArrayList<>(files.size());
        for (MultipartFile file : files) {
            byte[] data = readBytes(file);
            if (data.length == 0) {
                throw new InvalidPhotoException();
            }
            if (data.length > MAX_PHOTO_BYTES) {
                throw new PhotoTooLargeException();
            }

            String contentType = detectContentType(data);
            if (contentType == null) {
                throw new UnsupportedPhotoTypeException();
            }

            StoredPhotoEntity stored = repository.save(new StoredPhotoEntity(contentType, data));
            urls.add(PUBLIC_PATH + stored.getId());
        }

        deleteAbandonedPhotos();
        return urls;
    }

    @Transactional(readOnly = true)
    public StoredPhotoEntity requirePhoto(String rawId) {
        long id;
        try {
            id = Long.parseLong(rawId);
        } catch (NumberFormatException error) {
            throw new PhotoNotFoundException();
        }
        return repository.findById(id).orElseThrow(PhotoNotFoundException::new);
    }

    /**
     * Remove blobs antigos que nao estao referenciados por nenhum animal. E executado
     * durante novos uploads; nao depende de scheduler nem de uma segunda instancia.
     */
    @Transactional
    public void deleteAbandonedPhotos() {
        LocalDateTime cutoff = LocalDateTime.now(Clock.systemUTC()).minus(ORPHAN_RETENTION);
        List<Long> candidates = repository.findIdsCreatedBefore(cutoff);
        if (candidates.isEmpty()) {
            return;
        }

        Set<Long> referenced = animalRepository.findStoredPhotoUrls().stream()
                .map(PhotoStorageService::storedPhotoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Long> abandoned = candidates.stream()
                .filter(id -> !referenced.contains(id))
                .toList();
        if (!abandoned.isEmpty()) {
            repository.deleteAllByIdInBatch(abandoned);
        }
    }

    private static byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException error) {
            throw new InvalidPhotoException();
        }
    }

    static String detectContentType(byte[] data) {
        if (data.length >= 3
                && unsigned(data[0]) == 0xFF
                && unsigned(data[1]) == 0xD8
                && unsigned(data[2]) == 0xFF) {
            return "image/jpeg";
        }
        if (data.length >= 8
                && unsigned(data[0]) == 0x89
                && data[1] == 'P'
                && data[2] == 'N'
                && data[3] == 'G'
                && unsigned(data[4]) == 0x0D
                && unsigned(data[5]) == 0x0A
                && unsigned(data[6]) == 0x1A
                && unsigned(data[7]) == 0x0A) {
            return "image/png";
        }
        if (data.length >= 12
                && data[0] == 'R'
                && data[1] == 'I'
                && data[2] == 'F'
                && data[3] == 'F'
                && data[8] == 'W'
                && data[9] == 'E'
                && data[10] == 'B'
                && data[11] == 'P') {
            return "image/webp";
        }
        return null;
    }

    static Long storedPhotoId(String url) {
        if (url == null || !url.startsWith(PUBLIC_PATH)) {
            return null;
        }
        String rawId = url.substring(PUBLIC_PATH.length());
        if (rawId.isEmpty() || rawId.indexOf('/') >= 0 || rawId.indexOf('?') >= 0) {
            return null;
        }
        try {
            long id = Long.parseLong(rawId);
            return id > 0 ? id : null;
        } catch (NumberFormatException error) {
            return null;
        }
    }

    private static int unsigned(byte value) {
        return value & 0xFF;
    }
}
