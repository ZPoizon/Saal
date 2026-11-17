package br.org.saal.api.interest;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.saal.api.animal.AnimalEntity;
import br.org.saal.api.animal.AnimalService;
import br.org.saal.api.domain.AdoptionEligibilityPolicy;
import br.org.saal.api.domain.InterestContactPolicy;

/**
 * Registra e consulta manifestacoes de interesse. O envio publico so persiste quando o
 * animal esta AVAILABLE; as consultas devolvem PII e sao usadas apenas por rotas admin.
 */
@Service
public class AnimalInterestService {
    private final AnimalInterestRepository repository;
    private final AnimalService animalService;

    public AnimalInterestService(AnimalInterestRepository repository, AnimalService animalService) {
        this.repository = repository;
        this.animalService = animalService;
    }

    @Transactional
    public AnimalInterestReceipt register(String animalId, AnimalInterestRequest input) {
        AnimalEntity animal = animalService.requireExistingAnimal(animalId);
        if (!AdoptionEligibilityPolicy.canExpressInterest(animal.getStatus())) {
            throw new AnimalNotAvailableException();
        }
        String fullName = input.fullName().trim();
        String city = input.city().trim();
        if (fullName.length() < 3 || city.length() < 2) {
            throw new IllegalArgumentException("Dados da manifestacao invalidos.");
        }
        String whatsapp = InterestContactPolicy.requireValidWhatsapp(input.whatsapp());
        AnimalInterestEntity saved = repository.save(new AnimalInterestEntity(
                animal,
                fullName,
                whatsapp,
                city,
                input.email().trim().toLowerCase(Locale.ROOT)));
        return new AnimalInterestReceipt(true, saved.getCreatedAt() == null
                ? null
                : saved.getCreatedAt().toString());
    }

    @Transactional(readOnly = true)
    public List<AdminAnimalInterestResponse> listInterests() {
        return repository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(AdminAnimalInterestResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminAnimalInterestResponse> listInterestsByAnimal(String animalId) {
        AnimalEntity animal = animalService.requireExistingAnimal(animalId);
        return repository.findByAnimalIdOrderByCreatedAtDescIdDesc(animal.getId()).stream()
                .map(AdminAnimalInterestResponse::from)
                .toList();
    }
}
