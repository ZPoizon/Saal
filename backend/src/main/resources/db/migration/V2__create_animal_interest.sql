-- Manifestacoes de interesse em adocao. Migracao incremental: a V1 nao e alterada.
-- Compativel com MySQL 8 e H2 em MODE=MySQL: sem ENGINE, CHARSET ou COMMENT.
-- Sem ON DELETE CASCADE: o registro de interesse nao deve desaparecer junto do animal.
-- Finalidade, base legal e retencao de dados pessoais continuam pendentes (ONG-05).
CREATE TABLE animal_interest (
    id BIGINT NOT NULL AUTO_INCREMENT,
    animal_id BIGINT NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    whatsapp VARCHAR(32) NOT NULL,
    city VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT pk_animal_interest PRIMARY KEY (id),
    CONSTRAINT fk_animal_interest_animal FOREIGN KEY (animal_id) REFERENCES animal (id)
);

-- Ordenacao administrativa por data/hora de registro (mais recentes primeiro).
CREATE INDEX idx_animal_interest_created_at ON animal_interest (created_at);
