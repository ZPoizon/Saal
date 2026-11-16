package br.org.saal.api.domain;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Porte do animal. O vocabulario de dominio ainda depende de aprovacao (ONG-10);
 * os valores abaixo apenas preservam o prototipo ja existente no frontend.
 */
public enum AnimalSize {
    PEQUENO("pequeno"),
    MEDIO("m\u00e9dio"),
    GRANDE("grande");

    private final String wireValue;

    AnimalSize(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }

    @JsonCreator
    public static AnimalSize fromWire(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return Arrays.stream(values())
                .filter(size -> size.wireValue.equalsIgnoreCase(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Porte de animal invalido."));
    }
}
