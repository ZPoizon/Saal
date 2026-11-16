package br.org.saal.api.animal;

import java.util.List;

import br.org.saal.api.domain.AnimalSex;
import br.org.saal.api.domain.AnimalSize;
import br.org.saal.api.domain.AnimalSpecies;
import br.org.saal.api.domain.AnimalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Entrada administrativa de animal. A validacao autoritativa e feita no servidor; a
 * quantidade de fotos (1-3) e reforcada pela {@link br.org.saal.api.domain.AnimalPhotoPolicy}.
 */
public record AnimalInputRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull AnimalSpecies species,
        @NotBlank @Size(max = 40) String age,
        @NotNull AnimalSize size,
        @NotNull AnimalSex sex,
        @NotNull AnimalStatus status,
        @NotBlank @Size(max = 2000) String description,
        @Size(max = 10) List<@NotBlank @Size(max = 60) String> personality,
        @Size(max = 1000) String medicalInfo,
        @NotNull @Size(min = 1, max = 3) List<@NotBlank @Size(max = 2048) String> photos) {
}
