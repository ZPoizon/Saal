package br.org.saal.api.photo;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

/**
 * Fotografia binaria persistida no MySQL. O conteudo e imutavel e servido por
 * {@code GET /api/v1/photos/{id}}; o animal referencia a URL publica.
 */
@Entity
@Table(name = "stored_photo")
public class StoredPhotoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type", nullable = false, length = 64)
    private String contentType;

    @Column(name = "byte_size", nullable = false)
    private int byteSize;

    @Lob
    @Column(name = "data", nullable = false)
    private byte[] data;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected StoredPhotoEntity() {
        // Exigido pelo JPA.
    }

    StoredPhotoEntity(String contentType, byte[] data) {
        this.contentType = contentType;
        this.byteSize = data.length;
        this.data = data;
    }

    public Long getId() {
        return id;
    }

    public String getContentType() {
        return contentType;
    }

    public int getByteSize() {
        return byteSize;
    }

    public byte[] getData() {
        return data;
    }
}
