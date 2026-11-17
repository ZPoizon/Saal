package br.org.saal.api.animal;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.saal.api.domain.AnimalPhotoPolicy;
import br.org.saal.api.domain.AnimalSpecies;
import br.org.saal.api.domain.AnimalStatus;

@Service
public class AnimalService {
    private final AnimalRepository repository;

    public AnimalService(AnimalRepository repository) {
        this.repository = repository;
    }

    /** Catalogo publico: somente animais AVAILABLE, com filtros opcionais por nome e especie. */
    @Transactional(readOnly = true)
    public List<PublicAnimalResponse> listPublicAnimals(String search, String species) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        AnimalSpecies speciesFilter = species == null || species.isBlank()
                ? null
                : AnimalSpecies.fromWire(species);

        return repository.findAllByOrderByIdAsc().stream()
                .filter(animal -> animal.getStatus() == AnimalStatus.AVAILABLE)
                .filter(animal -> speciesFilter == null || animal.getSpecies() == speciesFilter)
                .filter(animal -> normalizedSearch.isEmpty()
                        || animal.getName().toLowerCase(Locale.ROOT).contains(normalizedSearch))
                .map(PublicAnimalResponse::from)
                .toList();
    }

    /** Detalhe publico: qualquer estado aprovado, sem informacao medica. */
    @Transactional(readOnly = true)
    public PublicAnimalResponse getPublicAnimal(String id) {
        return PublicAnimalResponse.from(requireAnimal(id));
    }

    @Transactional(readOnly = true)
    public List<AnimalResponse> listAdminAnimals() {
        return repository.findAllByOrderByIdAsc().stream()
                .map(AnimalResponse::from)
                .toList();
    }

    /** Detalhe administrativo: inclui informacao medica; exige ROLE_ADMIN na camada HTTP. */
    @Transactional(readOnly = true)
    public AnimalResponse getAdminAnimal(String id) {
        return AnimalResponse.from(requireAnimal(id));
    }

    @Transactional
    public AnimalResponse createAnimal(AnimalInputRequest input) {
        AnimalEntity animal = new AnimalEntity();
        applyInput(animal, input);
        return AnimalResponse.from(repository.save(animal));
    }

    @Transactional
    public AnimalResponse updateAnimal(String id, AnimalInputRequest input) {
        AnimalEntity animal = requireAnimal(id);
        applyInput(animal, input);
        return AnimalResponse.from(repository.save(animal));
    }

    /**
     * Resolve a entidade para regras internas entre servicos (ex.: validar o estado antes de
     * registrar uma manifestacao de interesse). Nao e usada para serializacao de resposta.
     */
    @Transactional(readOnly = true)
    public AnimalEntity requireExistingAnimal(String id) {
        return requireAnimal(id);
    }

    private void applyInput(AnimalEntity animal, AnimalInputRequest input) {
        AnimalPhotoPolicy.requireValidCount(input.photos().size());
        animal.setName(input.name().trim());
        animal.setSpecies(input.species());
        animal.setAge(input.age().trim());
        animal.setSize(input.size());
        animal.setSex(input.sex());
        animal.setStatus(input.status());
        animal.setDescription(input.description().trim());
        animal.setPersonality(joinPersonality(input.personality()));
        animal.setMedicalInfo(input.medicalInfo() == null ? "" : input.medicalInfo().trim());
        animal.replacePhotos(input.photos().stream().map(String::trim).toList());
    }

    private static String joinPersonality(List<String> personality) {
        if (personality == null) {
            return "";
        }
        return personality.stream()
                .map(String::trim)
                .filter(part -> !part.isEmpty())
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }

    private AnimalEntity requireAnimal(String id) {
        Long parsedId;
        try {
            parsedId = Long.valueOf(id);
        } catch (NumberFormatException error) {
            throw new AnimalNotFoundException();
        }
        return repository.findById(parsedId).orElseThrow(AnimalNotFoundException::new);
    }
}
