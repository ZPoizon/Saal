package br.org.saal.api.animal;

import java.util.Arrays;
import java.util.List;

/**
 * Projecao administrativa de animal. Inclui {@code medicalInfo} e so pode ser devolvida por
 * rotas protegidas por ROLE_ADMIN; a projecao publica e {@link PublicAnimalResponse}.
 */
public record AnimalResponse(
        String id,
        String name,
        String species,
        String age,
        String size,
        String sex,
        String status,
        String description,
        List<String> personality,
        String medicalInfo,
        List<String> photos) {

    static AnimalResponse from(AnimalEntity animal) {
        return new AnimalResponse(
                String.valueOf(animal.getId()),
                animal.getName(),
                animal.getSpecies().wireValue(),
                animal.getAge(),
                animal.getSize().wireValue(),
                animal.getSex().wireValue(),
                animal.getStatus().name(),
                animal.getDescription(),
                splitPersonality(animal.getPersonality()),
                animal.getMedicalInfo(),
                animal.getPhotos().stream().map(AnimalPhotoEntity::getUrl).toList());
    }

    static List<String> splitPersonality(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(part -> !part.isEmpty())
                .toList();
    }
}
