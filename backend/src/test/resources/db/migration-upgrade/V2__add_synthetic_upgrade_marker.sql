-- APENAS TESTE: alteracao aditiva usada para verificar preservacao durante upgrade.
ALTER TABLE saal_upgrade_fixture
    ADD COLUMN migration_marker VARCHAR(32) NULL;
