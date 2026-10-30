package br.org.saal.api.auth;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

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
        AdminCredentialsProperties properties = new AdminCredentialsProperties();
        properties.setUsername(username);
        properties.setPasswordHash(passwordHash);
        return properties;
    }

    private static String validPasswordHash() {
        return "{bcrypt}" + new BCryptPasswordEncoder(12).encode("synthetic-test-password");
    }
}
