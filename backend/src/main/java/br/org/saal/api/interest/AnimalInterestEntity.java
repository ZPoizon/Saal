package br.org.saal.api.interest;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import br.org.saal.api.animal.AnimalEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Manifestacao de interesse associada a um animal existente. Contem dados pessoais: nunca
 * e serializada diretamente. A projecao publica ({@link AnimalInterestReceipt}) nao expoe
 * esses campos; somente a projecao administrativa o faz.
 */
@Entity
@Table(name = "animal_interest")
public class AnimalInterestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private AnimalEntity animal;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "whatsapp", nullable = false, length = 32)
    private String whatsapp;

    @Column(name = "city", nullable = false, length = 120)
    private String city;

    @Column(name = "email", nullable = false, length = 160)
    private String email;

    /** Data/hora autoritativa do servidor: nunca confiar no relogio do cliente (ONG-08). */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected AnimalInterestEntity() {
        // Exigido pelo JPA.
    }

    public AnimalInterestEntity(
            AnimalEntity animal, String fullName, String whatsapp, String city, String email) {
        this.animal = animal;
        this.fullName = fullName;
        this.whatsapp = whatsapp;
        this.city = city;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public AnimalEntity getAnimal() {
        return animal;
    }

    public String getFullName() {
        return fullName;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public String getCity() {
        return city;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
