package br.org.saal.api.animal;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalRepository extends JpaRepository<AnimalEntity, Long> {
    /** Carrega o catalogo com as fotos em uma unica consulta, na ordem de cadastro. */
    @EntityGraph(attributePaths = "photos")
    List<AnimalEntity> findAllByOrderByIdAsc();
}
