package br.org.saal.api.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;

public final class TestAdminProperties {
    public static final String USERNAME = "synthetic-admin";
    public static final String PASSWORD = "synthetic-test-password";

    private static final String PASSWORD_HASH =
            "{bcrypt}" + new BCryptPasswordEncoder(12).encode(PASSWORD);

    private TestAdminProperties() {
    }

    public static void register(DynamicPropertyRegistry registry) {
        registry.add("saal.admin.username", () -> USERNAME);
        registry.add("saal.admin.password-hash", () -> PASSWORD_HASH);
    }
}
