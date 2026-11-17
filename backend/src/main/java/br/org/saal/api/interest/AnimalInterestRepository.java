package br.org.saal.api.interest;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalInterestRepository extends JpaRepository<AnimalInterestEntity, Long> {
    /** Lista administrativa: mais recentes primeiro, com o animal resolvido na mesma consulta. */
    @EntityGraph(attributePaths = "animal")
    List<AnimalInterestEntity> findAllByOrderByCreatedAtDescIdDesc();

    /** Consulta administrativa dos interessados de um animal especifico. */
    @EntityGraph(attributePaths = "animal")
    List<AnimalInterestEntity> findByAnimalIdOrderByCreatedAtDescIdDesc(Long animalId);
}
