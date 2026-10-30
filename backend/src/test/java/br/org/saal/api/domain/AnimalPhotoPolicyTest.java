package br.org.saal.api.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AnimalPhotoPolicyTest {
    @Test
    void permiteUmaDuasOuTresFotos() {
        assertTrue(AnimalPhotoPolicy.isValidCount(1));
        assertTrue(AnimalPhotoPolicy.isValidCount(2));
        assertTrue(AnimalPhotoPolicy.isValidCount(3));
        assertDoesNotThrow(() -> AnimalPhotoPolicy.requireValidCount(3));
    }

    @Test
    void rejeitaNenhumaOuMaisDeTresFotos() {
        assertFalse(AnimalPhotoPolicy.isValidCount(0));
        assertFalse(AnimalPhotoPolicy.isValidCount(4));
        assertFalse(AnimalPhotoPolicy.isValidCount(-1));
        assertThrows(IllegalArgumentException.class, () -> AnimalPhotoPolicy.requireValidCount(0));
        assertThrows(IllegalArgumentException.class, () -> AnimalPhotoPolicy.requireValidCount(4));
    }
}
