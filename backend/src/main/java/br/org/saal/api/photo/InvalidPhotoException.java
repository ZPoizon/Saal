package br.org.saal.api.photo;

public class InvalidPhotoException extends RuntimeException {
    public InvalidPhotoException() {
        super("Fotografia invalida.");
    }
}
