package br.org.saal.api.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;

import br.org.saal.api.auth.TestAdminProperties;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.Container.ExecResult;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Teste de integracao EXECUTADO somente com: mvnw -Pdb-integration verify. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class MySqlFlywayIT {
    private static final String ROOT_PASSWORD = randomPassword();
    private static final String MIGRATION_PASSWORD = randomPassword();
    private static final String RUNTIME_PASSWORD = randomPassword();
    private static final String MIGRATION_USER = "saal_migrator";
    private static final String RUNTIME_USER = "saal_runtime";

    @Container
    static final MySQLContainer mysql = new MySQLContainer("mysql:8.4")
            .withDatabaseName("saal_it")
            .withUsername("root")
            .withPassword(ROOT_PASSWORD);

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {
        TestAdminProperties.register(registry);
        mysql.start();
        createDatabaseUsers();
        registry.add("spring.datasource.url", MySqlFlywayIT::runtimeJdbcUrl);
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.datasource.username", () -> RUNTIME_USER);
        registry.add("spring.datasource.password", () -> RUNTIME_PASSWORD);
        registry.add("spring.flyway.url", mysql::getJdbcUrl);
        registry.add("spring.flyway.user", () -> MIGRATION_USER);
        registry.add("spring.flyway.password", () -> MIGRATION_PASSWORD);
    }

    private static void createDatabaseUsers() {
        try (Connection connection = DriverManager.getConnection(
                mysql.getJdbcUrl(), "root", ROOT_PASSWORD);
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE USER '" + MIGRATION_USER + "'@'%' IDENTIFIED BY '"
                    + MIGRATION_PASSWORD + "'");
            statement.execute("GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, "
                    + "REFERENCES, SHOW VIEW, TRIGGER ON saal_it.* TO '"
                    + MIGRATION_USER + "'@'%'");
            statement.execute("CREATE DATABASE saal_upgrade");
            statement.execute("GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, "
                    + "REFERENCES, SHOW VIEW, TRIGGER ON saal_upgrade.* TO '"
                    + MIGRATION_USER + "'@'%'");
            statement.execute("CREATE USER '" + RUNTIME_USER + "'@'%' IDENTIFIED BY '"
                    + RUNTIME_PASSWORD + "'");
        } catch (SQLException error) {
            throw new IllegalStateException("Could not provision isolated MySQL test accounts", error);
        }
    }

    private static String randomPassword() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private static String runtimeJdbcUrl() {
        return mysql.getJdbcUrl().replace("/saal_it", "");
    }

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void flywayAplicaCatalogoEInteressesSemDarAcessoDeLeituraAoRuntime() throws SQLException {
        assertEquals(1, jdbc.queryForObject("SELECT 1", Integer.class));
        assertThrows(
                DataAccessException.class,
                () -> jdbc.queryForObject("SELECT COUNT(*) FROM animal", Integer.class));
        assertThrows(
                DataAccessException.class,
                () -> jdbc.queryForObject("SELECT COUNT(*) FROM animal_interest", Integer.class));

        try (Connection connection = migrationConnection();
             Statement statement = connection.createStatement()) {
            try (ResultSet result = statement.executeQuery(
                    "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 1")) {
                result.next();
                assertEquals(2, result.getInt(1));
            }
            try (ResultSet result = statement.executeQuery(
                    "SELECT COUNT(*) FROM information_schema.tables "
                            + "WHERE table_schema = 'saal_it' "
                            + "AND table_name = 'animal_interest'")) {
                result.next();
                assertEquals(1, result.getInt(1));
            }
            try (ResultSet result = statement.executeQuery(
                    "SELECT COUNT(*) FROM information_schema.key_column_usage "
                            + "WHERE table_schema = 'saal_it' "
                            + "AND table_name = 'animal_interest' "
                            + "AND referenced_table_name = 'animal'")) {
                result.next();
                assertEquals(1, result.getInt(1));
            }
        }
    }

    @Test
    void migracaoDaVersaoAnteriorPreservaDadosSinteticos() throws SQLException {
        Flyway versionOne = Flyway.configure()
                .dataSource(upgradeJdbcUrl(), MIGRATION_USER, MIGRATION_PASSWORD)
                .locations("classpath:db/migration-upgrade")
                .table("flyway_upgrade_history")
                .target(MigrationVersion.fromVersion("1"))
                .load();
        versionOne.migrate();

        try (Connection connection = upgradeConnection();
             Statement statement = connection.createStatement()) {
            statement.executeUpdate(
                    "INSERT INTO saal_upgrade_fixture (id, verification_code) "
                            + "VALUES (1, 'synthetic-upgrade-check')");
        }

        Flyway.configure()
                .dataSource(upgradeJdbcUrl(), MIGRATION_USER, MIGRATION_PASSWORD)
                .locations("classpath:db/migration-upgrade")
                .table("flyway_upgrade_history")
                .load()
                .migrate();

        try (Connection connection = upgradeConnection();
             Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery(
                     "SELECT verification_code, migration_marker "
                             + "FROM saal_upgrade_fixture WHERE id = 1")) {
            result.next();
            assertEquals("synthetic-upgrade-check", result.getString("verification_code"));
            assertNull(result.getString("migration_marker"));
        }
    }

    @Test
    void backupSinteticoPodeSerRestauradoEmOutroSchema() throws Exception {
        try (Connection connection = migrationConnection();
             Statement statement = connection.createStatement()) {
            statement.execute(
                    "CREATE TABLE saal_backup_probe (id BIGINT PRIMARY KEY, "
                            + "verification_code VARCHAR(48) NOT NULL)");
            statement.executeUpdate(
                    "INSERT INTO saal_backup_probe VALUES (1, 'synthetic-backup-check')");
        }

        ExecResult backup = mysql.execInContainer(
                "sh",
                "-c",
                "MYSQL_PWD=" + MIGRATION_PASSWORD
                        + " mysqldump --single-transaction --skip-lock-tables --no-tablespaces"
                        + " --user=" + MIGRATION_USER
                        + " saal_it saal_backup_probe > /tmp/saal-synthetic-backup.sql");
        assertEquals(0, backup.getExitCode(), backup.getStderr());

        try (Connection connection = rootConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE DATABASE saal_restore");
        }

        ExecResult restore = mysql.execInContainer(
                "sh",
                "-c",
                "MYSQL_PWD=" + ROOT_PASSWORD
                        + " mysql --user=root saal_restore < /tmp/saal-synthetic-backup.sql");
        assertEquals(0, restore.getExitCode(), restore.getStderr());

        try (Connection connection = DriverManager.getConnection(
                mysql.getJdbcUrl().replace("/saal_it", "/saal_restore"), "root", ROOT_PASSWORD);
             Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery(
                     "SELECT verification_code FROM saal_backup_probe WHERE id = 1")) {
            result.next();
            assertEquals("synthetic-backup-check", result.getString(1));
        }
    }

    private static Connection migrationConnection() throws SQLException {
        return DriverManager.getConnection(mysql.getJdbcUrl(), MIGRATION_USER, MIGRATION_PASSWORD);
    }

    private static Connection upgradeConnection() throws SQLException {
        return DriverManager.getConnection(upgradeJdbcUrl(), MIGRATION_USER, MIGRATION_PASSWORD);
    }

    private static String upgradeJdbcUrl() {
        return mysql.getJdbcUrl().replace("/saal_it", "/saal_upgrade");
    }

    private static Connection rootConnection() throws SQLException {
        return DriverManager.getConnection(mysql.getJdbcUrl(), "root", ROOT_PASSWORD);
    }
}
