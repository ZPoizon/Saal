package br.org.saal.api.interest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Entrada publica de manifestacao de interesse. O animal vem do caminho da requisicao; a
 * validacao autoritativa ocorre no servidor e a resposta publica nunca devolve estes dados.
 */
public record AnimalInterestRequest(
        @NotBlank @Size(min = 3, max = 120) String fullName,
        @NotBlank @Size(max = 32) @Pattern(regexp = "\\s*\\+?[0-9\\s().-]+\\s*") String whatsapp,
        @NotBlank @Size(min = 2, max = 120) String city,
        @NotBlank @Size(max = 160) @Email String email) {
}
