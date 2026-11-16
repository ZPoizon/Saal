-- Catalogo de animais. Schema inicial de negocio definido por instrucao explicita do
-- mantenedor em 2026-11-15; as regras de campos continuam pendentes na ONG (ONG-10).
-- Compativel com MySQL 8 e H2 em MODE=MySQL: sem ENGINE, CHARSET ou COMMENT.
CREATE TABLE animal (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    species VARCHAR(16) NOT NULL,
    age VARCHAR(40) NOT NULL,
    size VARCHAR(16) NOT NULL,
    sex VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    personality VARCHAR(1000) NOT NULL,
    medical_info VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT pk_animal PRIMARY KEY (id)
);

-- Fotos sao referencias textuais (1-3 por animal). Nao ha upload nem armazenamento
-- binario: formato, storage e retencao continuam pendentes (ONG-06).
CREATE TABLE animal_photo (
    id BIGINT NOT NULL AUTO_INCREMENT,
    animal_id BIGINT NOT NULL,
    sort_order INT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    CONSTRAINT pk_animal_photo PRIMARY KEY (id),
    CONSTRAINT fk_animal_photo_animal FOREIGN KEY (animal_id) REFERENCES animal (id) ON DELETE CASCADE,
    CONSTRAINT uq_animal_photo_order UNIQUE (animal_id, sort_order)
);
