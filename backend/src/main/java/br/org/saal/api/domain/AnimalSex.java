package br.org.saal.api.domain;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Sexo do animal. O vocabulario de dominio ainda depende de aprovacao (ONG-10);
 * os valores abaixo apenas preservam o prototipo ja existente no frontend.
 */
public enum AnimalSex {
    MACHO("macho"),
    FEMEA("f\u00eamea");

    private final String wireValue;

    AnimalSex(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }

    @JsonCreator
    public static AnimalSex fromWire(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return Arrays.stream(values())
                .filter(sex -> sex.wireValue.equalsIgnoreCase(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Sexo de animal invalido."));
    }
}
