package br.org.saal.api.animal;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Catalogo publico: somente leitura, sem autenticacao e sem informacao medica. */
@RestController
@RequestMapping("/api/v1/animals")
public class AnimalPublicController {
    private final AnimalService service;

    public AnimalPublicController(AnimalService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicAnimalResponse> list(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "species", required = false) String species) {
        return service.listPublicAnimals(search, species);
    }

    @GetMapping("/{animalId}")
    public PublicAnimalResponse get(@PathVariable String animalId) {
        return service.getPublicAnimal(animalId);
    }
}
