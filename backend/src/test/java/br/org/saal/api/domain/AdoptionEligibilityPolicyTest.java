package br.org.saal.api.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdoptionEligibilityPolicyTest {
    @Test
    void animalDisponivelPodeReceberInteresse() {
        assertTrue(AdoptionEligibilityPolicy.canExpressInterest(AnimalStatus.AVAILABLE));
    }

    @Test
    void animalAdotadoNaoPodeReceberInteresse() {
        assertFalse(AdoptionEligibilityPolicy.canExpressInterest(AnimalStatus.ADOPTED));
    }

    @Test
    void estadoNuloEhRejeitado() {
        assertThrows(NullPointerException.class,
                () -> AdoptionEligibilityPolicy.canExpressInterest(null));
    }
}
