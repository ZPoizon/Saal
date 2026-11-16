package br.org.saal.api.animal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import br.org.saal.api.domain.AnimalSex;
import br.org.saal.api.domain.AnimalSize;
import br.org.saal.api.domain.AnimalSpecies;
import br.org.saal.api.domain.AnimalStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

/**
 * Entidade persistida do catalogo de animais. Nao e exposta diretamente: as respostas
 * usam DTOs ({@link AnimalResponse}).
 */
@Entity
@Table(name = "animal")
public class AnimalEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "species", nullable = false, length = 16)
    private AnimalSpecies species;

    @Column(name = "age", nullable = false, length = 40)
    private String age;

    @Enumerated(EnumType.STRING)
    @Column(name = "size", nullable = false, length = 16)
    private AnimalSize size;

    @Enumerated(EnumType.STRING)
    @Column(name = "sex", nullable = false, length = 16)
    private AnimalSex sex;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private AnimalStatus status;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    /** Personalidade serializada como lista separada por virgula (sem espacos). */
    @Column(name = "personality", nullable = false, length = 1000)
    private String personality;

    @Column(name = "medical_info", nullable = false, length = 1000)
    private String medicalInfo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "animal",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private List<AnimalPhotoEntity> photos = new ArrayList<>();

    protected AnimalEntity() {
        // Exigido pelo JPA.
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AnimalSpecies getSpecies() {
        return species;
    }

    public void setSpecies(AnimalSpecies species) {
        this.species = species;
    }

    public String getAge() {
        return age;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public AnimalSize getSize() {
        return size;
    }

    public void setSize(AnimalSize size) {
        this.size = size;
    }

    public AnimalSex getSex() {
        return sex;
    }

    public void setSex(AnimalSex sex) {
        this.sex = sex;
    }

    public AnimalStatus getStatus() {
        return status;
    }

    public void setStatus(AnimalStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }

    public String getMedicalInfo() {
        return medicalInfo;
    }

    public void setMedicalInfo(String medicalInfo) {
        this.medicalInfo = medicalInfo;
    }

    public List<AnimalPhotoEntity> getPhotos() {
        return photos;
    }

    /**
     * Substitui integralmente a lista de fotos preservando a ordem informada.
     *
     * <p>Atualiza as linhas existentes por indice, adiciona apenas as que faltam e remove
     * a cauda excedente. Evita inserir uma nova linha com o mesmo {@code sort_order} de
     * outra que sera excluida (o Hibernate executa inserts antes de deletes).</p>
     */
    public void replacePhotos(List<String> urls) {
        for (int index = 0; index < urls.size(); index++) {
            if (index < photos.size()) {
                photos.get(index).setUrl(urls.get(index));
            } else {
                photos.add(new AnimalPhotoEntity(this, index, urls.get(index)));
            }
        }
        while (photos.size() > urls.size()) {
            photos.remove(photos.size() - 1);
        }
    }
}
