-- Armazenamento definitivo das fotografias enviadas pelo painel administrativo.
-- O binario fica no proprio MySQL (Aiven) para evitar um servico externo adicional.
-- As linhas sao independentes do animal: o upload acontece antes do cadastro e a
-- referencia e gravada em animal_photo.url como /api/v1/photos/{id}.
-- Compativel com MySQL 8 e H2 em MODE=MySQL: sem ENGINE, CHARSET ou COMMENT.
CREATE TABLE stored_photo (
    id BIGINT NOT NULL AUTO_INCREMENT,
    content_type VARCHAR(64) NOT NULL,
    byte_size INT NOT NULL,
    data LONGBLOB NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT pk_stored_photo PRIMARY KEY (id)
);

-- A limpeza de uploads abandonados consulta por data de criacao.
CREATE INDEX idx_stored_photo_created_at ON stored_photo (created_at);
