package br.org.saal.api.database;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DatabaseCredentialSeparationValidatorTest {
    @Test
    void aceitaCredenciaisDeRuntimeEMigrationDistintas() {
        assertDoesNotThrow(() ->
                new DatabaseCredentialSeparationValidator("runtime", "runtime-secret",
                        "migration", "migration-secret"));
    }

    @Test
    void rejeitaUsuarioOuSenhaCompartilhados() {
        assertThrows(IllegalStateException.class, () ->
                new DatabaseCredentialSeparationValidator("saal", "runtime-secret",
                        "saal", "migration-secret"));
        assertThrows(IllegalStateException.class, () ->
                new DatabaseCredentialSeparationValidator("runtime", "same-secret",
                        "migration", "same-secret"));
    }
}
