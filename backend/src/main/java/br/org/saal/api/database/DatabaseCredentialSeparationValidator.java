package br.org.saal.api.database;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        prefix = "saal.database",
        name = "enforce-credential-separation",
        havingValue = "true",
        matchIfMissing = true)
class DatabaseCredentialSeparationValidator {
    DatabaseCredentialSeparationValidator(
            @Value("${spring.datasource.username}") String runtimeUser,
            @Value("${spring.datasource.password}") String runtimePassword,
            @Value("${spring.flyway.user}") String migrationUser,
            @Value("${spring.flyway.password}") String migrationPassword) {
        if (runtimeUser.equals(migrationUser) || runtimePassword.equals(migrationPassword)) {
            throw new IllegalStateException(
                    "Database runtime and migration credentials must be distinct");
        }
    }
}
