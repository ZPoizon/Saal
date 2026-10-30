-- APENAS TESTE: src/test/resources, nunca empacotada no jar de producao.
-- Exercita migracao Flyway em H2 e MySQL Testcontainers sem inventar tabelas de dominio.
CREATE TABLE saal_test_pipeline (
    id BIGINT NOT NULL PRIMARY KEY,
    verification_code VARCHAR(32) NOT NULL
);
