package br.org.saal.api.domain;

import java.util.Objects;

/**
 * Regra de dominio aprovada: animal adotado nao admite nova manifestacao.
 * Nao processa formularios nem armazena dados pessoais (etapas futuras).
 */
public final class AdoptionEligibilityPolicy {
    private AdoptionEligibilityPolicy() { }

    public static boolean canExpressInterest(AnimalStatus status) {
        Objects.requireNonNull(status, "status nao pode ser nulo");
        return status == AnimalStatus.AVAILABLE;
    }
}
