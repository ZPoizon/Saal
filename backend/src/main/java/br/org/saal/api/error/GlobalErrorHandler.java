package br.org.saal.api.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import br.org.saal.api.animal.AnimalNotFoundException;
import br.org.saal.api.interest.AnimalNotAvailableException;
import br.org.saal.api.interest.InterestRateLimitExceededException;
import br.org.saal.api.photo.InvalidPhotoException;
import br.org.saal.api.photo.PhotoNotFoundException;
import br.org.saal.api.photo.PhotoTooLargeException;
import br.org.saal.api.photo.UnsupportedPhotoTypeException;
import jakarta.validation.ConstraintViolationException;

/**
 * Respostas de erro estruturadas (RFC 9457) sem expor mensagens internas nem valores
 * enviados pelo cliente.
 */
@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class GlobalErrorHandler {
    private static final Logger LOG = LoggerFactory.getLogger(GlobalErrorHandler.class);

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ProblemDetail> resourceNotFound(NoResourceFoundException error) {
        return problem(HttpStatus.NOT_FOUND, "Recurso nao encontrado",
                "O recurso solicitado nao foi encontrado.");
    }

    @ExceptionHandler(AnimalNotFoundException.class)
    public ResponseEntity<ProblemDetail> animalNotFound(AnimalNotFoundException error) {
        return problem(HttpStatus.NOT_FOUND, "Animal nao encontrado",
                "O animal solicitado nao foi encontrado.");
    }

    @ExceptionHandler(AnimalNotAvailableException.class)
    public ResponseEntity<ProblemDetail> animalNotAvailable(AnimalNotAvailableException error) {
        return problem(HttpStatus.CONFLICT, "Animal indisponivel",
                "Este animal nao esta disponivel para manifestacao de interesse.");
    }

    @ExceptionHandler(InterestRateLimitExceededException.class)
    public ResponseEntity<ProblemDetail> interestRateLimited(InterestRateLimitExceededException error) {
        return problem(HttpStatus.TOO_MANY_REQUESTS, "Muitas solicitacoes",
                "Nao foi possivel registrar a manifestacao agora. Tente novamente mais tarde.");
    }

    @ExceptionHandler(PhotoNotFoundException.class)
    public ResponseEntity<ProblemDetail> photoNotFound(PhotoNotFoundException error) {
        return problem(HttpStatus.NOT_FOUND, "Fotografia nao encontrada",
                "A fotografia solicitada nao foi encontrada.");
    }

    @ExceptionHandler({PhotoTooLargeException.class, MaxUploadSizeExceededException.class})
    public ResponseEntity<ProblemDetail> photoTooLarge(Exception error) {
        return problem(HttpStatus.PAYLOAD_TOO_LARGE, "Fotografia muito grande",
                "A fotografia excede o limite de 5 MB.");
    }

    @ExceptionHandler({UnsupportedPhotoTypeException.class, HttpMediaTypeNotSupportedException.class})
    public ResponseEntity<ProblemDetail> unsupportedPhotoType(Exception error) {
        return problem(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato nao suportado",
                "Envie uma fotografia JPG, PNG ou WebP.");
    }

    @ExceptionHandler(InvalidPhotoException.class)
    public ResponseEntity<ProblemDetail> invalidPhoto(InvalidPhotoException error) {
        return problem(HttpStatus.BAD_REQUEST, "Fotografia invalida",
                "Nao foi possivel ler a fotografia enviada.");
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ProblemDetail> invalidMultipart(MultipartException error) {
        return problem(HttpStatus.BAD_REQUEST, "Envio invalido",
                "O envio de arquivos e invalido.");
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            ConstraintViolationException.class,
            MissingServletRequestPartException.class,
            MissingServletRequestParameterException.class
    })
    public ResponseEntity<ProblemDetail> invalidPayload(Exception error) {
        return problem(HttpStatus.BAD_REQUEST, "Dados invalidos",
                "Os dados enviados sao invalidos.");
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<ProblemDetail> invalidRequest(Exception error) {
        return problem(HttpStatus.BAD_REQUEST, "Requisicao invalida",
                "A requisicao enviada e invalida.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> unexpected(Exception error) {
        // Evita logar mensagens da excecao: podem conter valores pessoais ou configuracoes.
        LOG.error("Falha nao tratada na API: {}", error.getClass().getSimpleName());
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno",
                "Nao foi possivel concluir a operacao.");
    }

    private static ResponseEntity<ProblemDetail> problem(
            HttpStatus status, String title, String detail) {
        ProblemDetail body = ProblemDetail.forStatusAndDetail(status, detail);
        body.setTitle(title);
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(body);
    }
}
