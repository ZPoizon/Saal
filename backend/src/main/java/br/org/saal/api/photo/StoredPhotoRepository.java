package br.org.saal.api.photo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StoredPhotoRepository extends JpaRepository<StoredPhotoEntity, Long> {
    /**
     * Lista apenas identificadores antigos: evita carregar os blobs ao procurar
     * uploads abandonados.
     */
    @Query("select photo.id from StoredPhotoEntity photo where photo.createdAt < :cutoff")
    List<Long> findIdsCreatedBefore(@Param("cutoff") LocalDateTime cutoff);
}
