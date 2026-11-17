package br.org.saal.api.interest;

/** Envios abusivos do mesmo cliente. Resposta 429 generica, sem revelar dados pessoais. */
public class InterestRateLimitExceededException extends RuntimeException {
    public InterestRateLimitExceededException() {
        super("Limite de envios atingido.");
    }
}
