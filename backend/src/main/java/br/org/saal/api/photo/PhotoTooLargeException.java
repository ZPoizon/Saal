package br.org.saal.api.photo;

public class PhotoTooLargeException extends RuntimeException {
    public PhotoTooLargeException() {
        super("Fotografia acima do limite permitido.");
    }
}
