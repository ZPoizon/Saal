# MySQL backup and restore — I3

The I3 integration test creates only synthetic rows in a disposable MySQL 8.4
Testcontainers instance. It runs `mysqldump` and restores the dump into a second,
isolated schema, then checks the synthetic row. It does not read or modify a local,
shared, or production database.

## Local development accounts

On a new Docker volume, `compose.dev.yaml` creates separate accounts:

- `saal_runtime`: no schema grants and a JDBC URL without a default database, sufficient
  for connection/health checks before any product persistence is approved.
- `saal_migrator`: schema-scoped DDL and migration-history privileges; never use it
  as the application datasource identity.
- `root`: initialization/administration only; do not configure it in the application.

Runtime credentials are required as `SAAL_DB_USER=saal_runtime` and
`SAAL_DB_PASSWORD`; Flyway uses `SAAL_DB_MIGRATION_USER=saal_migrator` and
`SAAL_DB_MIGRATION_PASSWORD`. The application refuses startup if either usernames
or passwords are shared. The initialization script runs only when MySQL initializes
an empty volume; never delete an existing volume to force account creation. For an
existing database, provision accounts deliberately and preserve its data.

The migration account's local grants are limited to the `saal` database. Exact
production grants and backup identity must be reviewed against approved migrations
and hosting. Runtime DML grants are not assigned until application operations and
their access requirements are approved.

## Synthetic backup/restore rehearsal

The automated `MySqlFlywayIT.backupSinteticoPodeSerRestauradoEmOutroSchema` test:

1. creates a test-only table and synthetic marker in the disposable source schema;
2. dumps only that table with `mysqldump --single-transaction`;
3. creates a separate empty restore schema;
4. restores the dump there and compares the synthetic marker.

No restore overwrites an existing schema or is run against a persistent/local database.
The test demonstrates a mechanics check, not an operational production backup policy.

For an approved production environment, a controlled operator can use a protected MySQL
option file (kept outside this repository, readable only by the operator account) and
an approved backup identity:

```powershell
mysqldump --defaults-extra-file=$env:SAAL_DB_BACKUP_OPTION_FILE --single-transaction --no-tablespaces --databases saal > $env:SAAL_BACKUP_FILE
mysql --defaults-extra-file=$env:SAAL_DB_RESTORE_OPTION_FILE < $env:SAAL_BACKUP_FILE
```

The restore command is for a newly provisioned, empty recovery instance only. Confirm
the restored database and application compatibility before any controlled cutover;
never test a restore by importing over the only copy of a live database. The backup
identity, option-file provisioning, encryption, retention and restore target are not
configured or approved by I3.

## Production operational gate

Before any real data is stored, the service owner must approve the hosting-specific
backup identity, encryption at rest/in transit, retention, access controls, schedule,
monitoring, restore-point objectives and a restore runbook. MySQL DDL is not assumed
transactional or rollback-safe. For a failed forward migration, preserve the database,
stop writes if needed, restore only under the approved recovery procedure, and prefer
a reviewed forward-fix. Destructive migrations and any production restore require
explicit approval; no `DROP` or volume deletion is part of the development rehearsal.
