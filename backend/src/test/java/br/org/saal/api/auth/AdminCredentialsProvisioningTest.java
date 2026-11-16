package br.org.saal.api.auth;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminCredentialsProvisioningTest {
    private final AdminSecurityConfiguration configuration = new AdminSecurityConfiguration();

    @Test
    void configuracaoSemUsernameRejeitaInicializacao() {
        AdminCredentialsProperties credentials = credentials("", validPasswordHash());

        assertThrows(IllegalStateException.class, () -> configuration.adminUserDetailsService(credentials));
    }

    @Test
    void configuracaoSemHashBcryptForteRejeitaInicializacao() {
        AdminCredentialsProperties credentials = credentials("configured-admin", "{bcrypt}invalid");

        assertThrows(IllegalStateException.class, () -> configuration.adminUserDetailsService(credentials));
    }

    @Test
    void configuracaoSemHashNemSenhaRejeitaInicializacao() {
        AdminCredentialsProperties credentials = credentials("configured-admin", "", "");

        assertThrows(IllegalStateException.class, () -> configuration.adminUserDetailsService(credentials));
    }

    @Test
    void provisionaComSenhaEmTextoConvertidaParaBcryptNoStartup() {
        AdminCredentialsProperties credentials = credentials(
                "configured-admin", "", "synthetic-test-password");
        UserDetailsService users = configuration.adminUserDetailsService(credentials);

        String encoded = users.loadUserByUsername("configured-admin").getPassword();
        assertTrue(encoded.startsWith("{bcrypt}$2a$12$"), encoded);
        assertTrue(new BCryptPasswordEncoder().matches(
                "synthetic-test-password", encoded.substring("{bcrypt}".length())));
    }

    @Test
    void hashTemPrecedenciaSobreSenhaEmTexto() {
        String hash = validPasswordHash();
        AdminCredentialsProperties credentials = credentials(
                "configured-admin", hash, "outra-senha-sintetica-longa");
        UserDetailsService users = configuration.adminUserDetailsService(credentials);

        assertEquals(hash, users.loadUserByUsername("configured-admin").getPassword());
    }

    @Test
    void senhaEmTextoCurtaRejeitaInicializacao() {
        AdminCredentialsProperties credentials = credentials(
                "configured-admin", "", "senha-curta");

        assertThrows(IllegalStateException.class, () -> configuration.adminUserDetailsService(credentials));
    }

    @Test
    void provisionaSomenteUmAdministradorComAutoridadeAdministrativa() {
        AdminCredentialsProperties credentials =
                credentials("configured-admin", validPasswordHash());
        UserDetailsService users = configuration.adminUserDetailsService(credentials);

        assertEquals(
                Set.of("ROLE_ADMIN"),
                users.loadUserByUsername("configured-admin").getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .collect(Collectors.toSet()));
        assertThrows(
                UsernameNotFoundException.class,
                () -> users.loadUserByUsername("unprovisioned-user"));
    }

    private static AdminCredentialsProperties credentials(String username, String passwordHash) {
        return credentials(username, passwordHash, null);
    }

    private static AdminCredentialsProperties credentials(
            String username, String passwordHash, String password) {
        AdminCredentialsProperties properties = new AdminCredentialsProperties();
        properties.setUsername(username);
        properties.setPasswordHash(passwordHash);
        properties.setPassword(password);
        return properties;
    }

    private static String validPasswordHash() {
        return "{bcrypt}" + new BCryptPasswordEncoder(12).encode("synthetic-test-password");
    }
}
