package br.org.saal.api.animal;

/** Animal inexistente ou identificador invalido. Resposta 404 sem detalhes internos. */
public class AnimalNotFoundException extends RuntimeException {
    public AnimalNotFoundException() {
        super("Animal nao encontrado.");
    }
}
