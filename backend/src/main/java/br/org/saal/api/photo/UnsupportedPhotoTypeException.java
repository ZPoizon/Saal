package br.org.saal.api.photo;

public class UnsupportedPhotoTypeException extends RuntimeException {
    public UnsupportedPhotoTypeException() {
        super("Formato de fotografia nao suportado.");
    }
}
