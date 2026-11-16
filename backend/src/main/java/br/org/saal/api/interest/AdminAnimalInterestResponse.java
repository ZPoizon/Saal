package br.org.saal.api.interest;

import br.org.saal.api.animal.AnimalEntity;

/**
 * Projecao administrativa de uma manifestacao de interesse. Contem PII e so pode ser
 * devolvida por rotas protegidas por ROLE_ADMIN. A foto do animal e resolvida no cliente a
 * partir de {@code animalId}, evitando carregar a colecao de fotos nesta consulta.
 */
public record AdminAnimalInterestResponse(
        String id,
        String animalId,
        String animalName,
        String fullName,
        String whatsapp,
        String city,
        String email,
        String createdAt) {

    static AdminAnimalInterestResponse from(AnimalInterestEntity interest) {
        AnimalEntity animal = interest.getAnimal();
        return new AdminAnimalInterestResponse(
                String.valueOf(interest.getId()),
                String.valueOf(animal.getId()),
                animal.getName(),
                interest.getFullName(),
                interest.getWhatsapp(),
                interest.getCity(),
                interest.getEmail(),
                interest.getCreatedAt() == null ? null : interest.getCreatedAt().toString());
    }
}
