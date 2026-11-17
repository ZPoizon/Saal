package br.org.saal.api.error;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class GlobalErrorHandlerTest {
    @Test
    void naoExibeDetalhesInternosNaResposta() {
        ResponseEntity<ProblemDetail> response = new GlobalErrorHandler()
                .unexpected(new IllegalStateException("senha=nao-exibir-esta-informacao"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(MediaType.APPLICATION_PROBLEM_JSON, response.getHeaders().getContentType());
        assertFalse(response.getBody().getDetail().contains("nao-exibir-esta-informacao"));
    }
}
