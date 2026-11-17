package br.org.saal.api.interest;

/** Animal fora de AVAILABLE: manifestacao de interesse nao e registrada. Resposta 409. */
public class AnimalNotAvailableException extends RuntimeException {
    public AnimalNotAvailableException() {
        super("Animal indisponivel para manifestacao de interesse.");
    }
}
