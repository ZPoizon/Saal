package br.org.saal.api.interest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Envio publico de interesse. Sem autenticacao nem dados do visitante; o CSRF e dispensado
 * apenas para esta rota (nao ha sessao a proteger) e a resposta nao devolve PII.
 */
@RestController
@RequestMapping("/api/v1/animals/{animalId}/interests")
public class AnimalInterestPublicController {
    private final AnimalInterestService service;
    private final InterestSubmissionLimiter limiter;

    public AnimalInterestPublicController(AnimalInterestService service, InterestSubmissionLimiter limiter) {
        this.service = service;
        this.limiter = limiter;
    }

    @PostMapping
    public ResponseEntity<AnimalInterestReceipt> create(
            @PathVariable String animalId,
            @Valid @RequestBody AnimalInterestRequest input,
            HttpServletRequest request) {
        String client = request.getRemoteAddr();
        if (!limiter.tryAcquire(client)) {
            throw new InterestRateLimitExceededException();
        }
        AnimalInterestReceipt receipt = service.register(animalId, input);
        return ResponseEntity.status(HttpStatus.CREATED).body(receipt);
    }
}
