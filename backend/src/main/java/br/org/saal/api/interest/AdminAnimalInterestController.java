package br.org.saal.api.interest;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Consulta administrativa dos interessados. Toda a rota exige ROLE_ADMIN, garantido pelo
 * filtro de seguranca; a autorizacao nao depende do cliente.
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminAnimalInterestController {
    private final AnimalInterestService service;

    public AdminAnimalInterestController(AnimalInterestService service) {
        this.service = service;
    }

    @GetMapping("/interests")
    public List<AdminAnimalInterestResponse> list() {
        return service.listInterests();
    }

    @GetMapping("/animals/{animalId}/interests")
    public List<AdminAnimalInterestResponse> listByAnimal(@PathVariable String animalId) {
        return service.listInterestsByAnimal(animalId);
    }
}
