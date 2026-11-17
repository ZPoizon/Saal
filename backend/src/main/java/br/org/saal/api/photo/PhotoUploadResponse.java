package br.org.saal.api.photo;

import java.util.List;

/** Resposta do upload: uma URL publica persistente por arquivo, na ordem enviada. */
public record PhotoUploadResponse(List<String> urls) {
}
