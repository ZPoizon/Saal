package br.org.saal.api.animal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Referencia textual de uma foto do animal. A quantidade (1-3) e validada pela
 * {@link br.org.saal.api.domain.AnimalPhotoPolicy}; nao ha conteudo binario nem upload.
 */
@Entity
@Table(
        name = "animal_photo",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_animal_photo_order",
                columnNames = {"animal_id", "sort_order"}))
public class AnimalPhotoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private AnimalEntity animal;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "url", nullable = false, length = 2048)
    private String url;

    protected AnimalPhotoEntity() {
        // Exigido pelo JPA.
    }

    AnimalPhotoEntity(AnimalEntity animal, int sortOrder, String url) {
        this.animal = animal;
        this.sortOrder = sortOrder;
        this.url = url;
    }

    public Long getId() {
        return id;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
