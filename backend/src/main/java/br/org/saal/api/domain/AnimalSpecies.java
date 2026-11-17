package br.org.saal.api.domain;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Especie do animal. O vocabulario de dominio ainda depende de aprovacao (ONG-10);
 * os valores abaixo apenas preservam o prototipo ja existente no frontend.
 */
public enum AnimalSpecies {
    DOG("dog"),
    CAT("cat");

    private final String wireValue;

    AnimalSpecies(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }

    @JsonCreator
    public static AnimalSpecies fromWire(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return Arrays.stream(values())
                .filter(species -> species.wireValue.equalsIgnoreCase(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Especie de animal invalida."));
    }
}
