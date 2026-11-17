package br.org.saal.api.animal;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Administracao de animais. Toda a rota exige ROLE_ADMIN e CSRF nas mutacoes, garantidos
 * pelo filtro de seguranca; a autorizacao nao depende do cliente.
 *
 * <p>A exclusao definitiva foi desabilitada enquanto a ONG nao aprovar a operacao de ciclo
 * de vida (ONG-03): a rota DELETE nao existe e responde 405.</p>
 */
@RestController
@RequestMapping("/api/v1/admin/animals")
public class AdminAnimalController {
    private final AnimalService service;

    public AdminAnimalController(AnimalService service) {
        this.service = service;
    }

    @GetMapping
    public List<AnimalResponse> list() {
        return service.listAdminAnimals();
    }

    @GetMapping("/{animalId}")
    public AnimalResponse get(@PathVariable String animalId) {
        return service.getAdminAnimal(animalId);
    }

    @PostMapping
    public ResponseEntity<AnimalResponse> create(@Valid @RequestBody AnimalInputRequest input) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createAnimal(input));
    }

    @PutMapping("/{animalId}")
    public AnimalResponse update(
            @PathVariable String animalId,
            @Valid @RequestBody AnimalInputRequest input) {
        return service.updateAnimal(animalId, input);
    }
}
