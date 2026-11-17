package br.org.saal.api.animal;

import java.util.List;

/**
 * Projecao publica de animal. Nao inclui {@code medicalInfo}: a finalidade, a sensibilidade
 * e a visibilidade desse campo seguem pendentes (ONG-05/ONG-10) e ele nao deve ser exposto
 * ao publico ate que os campos autorizados sejam definidos.
 */
public record PublicAnimalResponse(
        String id,
        String name,
        String species,
        String age,
        String size,
        String sex,
        String status,
        String description,
        List<String> personality,
        List<String> photos) {

    static PublicAnimalResponse from(AnimalEntity animal) {
        return new PublicAnimalResponse(
                String.valueOf(animal.getId()),
                animal.getName(),
                animal.getSpecies().wireValue(),
                animal.getAge(),
                animal.getSize().wireValue(),
                animal.getSex().wireValue(),
                animal.getStatus().name(),
                animal.getDescription(),
                AnimalResponse.splitPersonality(animal.getPersonality()),
                animal.getPhotos().stream().map(AnimalPhotoEntity::getUrl).toList());
    }
}
