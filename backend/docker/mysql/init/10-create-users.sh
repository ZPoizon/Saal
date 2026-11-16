#!/bin/bash
set -euo pipefail

if [[ -z "${SAAL_DB_RUNTIME_PASSWORD:-}" || -z "${SAAL_DB_MIGRATION_PASSWORD:-}" ]]; then
    echo "Runtime and migration passwords must be configured." >&2
    exit 1
fi

escape_sql_literal() {
    local escaped="${1//\\/\\\\}"
    escaped="${escaped//\'/\\\'}"
    printf '%s' "$escaped"
}

runtime_password="$(escape_sql_literal "$SAAL_DB_RUNTIME_PASSWORD")"
migration_password="$(escape_sql_literal "$SAAL_DB_MIGRATION_PASSWORD")"

MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --protocol=socket --user=root <<SQL
CREATE USER 'saal_runtime'@'%' IDENTIFIED BY '${runtime_password}';
GRANT SELECT, INSERT, UPDATE, DELETE ON saal.* TO 'saal_runtime'@'%';

CREATE USER 'saal_migrator'@'%' IDENTIFIED BY '${migration_password}';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, SHOW VIEW, TRIGGER
    ON saal.* TO 'saal_migrator'@'%';
SQL
