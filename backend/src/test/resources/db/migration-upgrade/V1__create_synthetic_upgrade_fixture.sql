-- APENAS TESTE: fixture tecnica para provar upgrade Flyway sem modelar dados do SAAL.
CREATE TABLE saal_upgrade_fixture (
    id BIGINT NOT NULL PRIMARY KEY,
    verification_code VARCHAR(48) NOT NULL
);
