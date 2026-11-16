package br.org.saal.api.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "saal.admin")
public class AdminCredentialsProperties {
    private String username;
    private String passwordHash;
    /**
     * Senha em texto claro aceita apenas como conveniencia de provisionamento em um
     * secret manager. Quando {@link #passwordHash} esta preenchido, ele tem precedencia.
     */
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
