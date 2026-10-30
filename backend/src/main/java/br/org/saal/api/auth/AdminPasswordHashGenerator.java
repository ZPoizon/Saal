package br.org.saal.api.auth;

import java.io.Console;
import java.nio.CharBuffer;
import java.util.Arrays;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public final class AdminPasswordHashGenerator {
    private static final int BCRYPT_STRENGTH = 12;

    private AdminPasswordHashGenerator() {
    }

    public static void writeHashToConsole() {
        Console console = System.console();
        if (console == null) {
            throw new IllegalStateException(
                    "Execute este comando em um terminal interativo para ocultar a senha digitada.");
        }

        char[] password = console.readPassword("Nova senha administrativa: ");
        char[] confirmation = console.readPassword("Confirme a senha: ");
        try {
            if (password == null || confirmation == null || password.length == 0) {
                throw new IllegalArgumentException("A senha não pode ser vazia.");
            }
            if (!Arrays.equals(password, confirmation)) {
                throw new IllegalArgumentException("As senhas não coincidem.");
            }

            String hash = "{bcrypt}" + new BCryptPasswordEncoder(BCRYPT_STRENGTH)
                    .encode(CharBuffer.wrap(password));
            console.printf("%s%n", hash);
            console.printf("Armazene o hash em SAAL_ADMIN_PASSWORD_HASH no secret manager.%n");
        } finally {
            Arrays.fill(password, '\0');
            Arrays.fill(confirmation, '\0');
        }
    }
}
