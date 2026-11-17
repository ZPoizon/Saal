package br.org.saal.api.photo;

public class PhotoNotFoundException extends RuntimeException {
    public PhotoNotFoundException() {
        super("Fotografia nao encontrada.");
    }
}
