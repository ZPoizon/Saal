package br.org.saal.api.domain;

/**
 * Regra explicitamente informada pela ONG (29/10/2026):
 * um animal deve ter de uma a tres fotos.
 *
 * Ainda nao escolhe armazenamento, extensoes, tamanhos ou modelos de imagem.
 */
public final class AnimalPhotoPolicy {
    public static final int MIN_PHOTOS = 1;
    public static final int MAX_PHOTOS = 3;

    private AnimalPhotoPolicy() { }

    public static boolean isValidCount(int count) {
        return count >= MIN_PHOTOS && count <= MAX_PHOTOS;
    }

    public static void requireValidCount(int count) {
        if (!isValidCount(count)) {
            throw new IllegalArgumentException("Cada animal deve ter de 1 a 3 fotos.");
        }
    }
}
