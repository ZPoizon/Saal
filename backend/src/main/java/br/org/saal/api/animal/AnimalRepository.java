package br.org.saal.api.animal;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AnimalRepository extends JpaRepository<AnimalEntity, Long> {
    /** Carrega o catalogo com as fotos em uma unica consulta, na ordem de cadastro. */
    @EntityGraph(attributePaths = "photos")
    List<AnimalEntity> findAllByOrderByIdAsc();

    /** URLs de fotos armazenadas no proprio banco, usadas na limpeza de orfaos. */
    @Query("select photo.url from AnimalPhotoEntity photo where photo.url like '/api/v1/photos/%'")
    List<String> findStoredPhotoUrls();
}
