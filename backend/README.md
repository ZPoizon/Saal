# SAAL API — I3: conectividade MySQL e regras de dominio

**Este incremento adiciona persistencia infraestrutural real (MySQL + Flyway), nao implementa ainda
CRUD de animais nem aceita dados pessoais.** Campos e regras ainda pendentes da ONG nao sao inventados.

## Preparacao

- JDK 21 ativo (`java -version` e `javac -version`)
- Docker Desktop aberto e integrado ao Windows (ou um MySQL 8 acessivel)
- PowerShell e acesso ao Maven Central para baixar novas dependencias
- `backend/` ja existe e foi integrado pelo PR I2

### Windows: iniciar MySQL local com Docker

Em PowerShell, use senhas pessoais SOMENTE locais. Nao publique em commit nem screenshots:

```powershell
cd C:\Users\leona\IdeaProjects\Saal-i3\backend
$env:SAAL_DB_RUNTIME_PASSWORD = Read-Host 'Senha runtime local'
$env:SAAL_DB_MIGRATION_PASSWORD = Read-Host 'Senha de migration local'
$env:SAAL_DB_ROOT_PASSWORD = Read-Host 'Senha root somente local'
docker compose -f compose.dev.yaml up -d
docker compose -f compose.dev.yaml ps
$env:SAAL_DB_RUNTIME_URL = 'jdbc:mysql://127.0.0.1:3307'
$env:SAAL_DB_MIGRATION_URL = 'jdbc:mysql://127.0.0.1:3307/saal'
$env:SAAL_DB_USER = 'saal_runtime'
$env:SAAL_DB_PASSWORD = $env:SAAL_DB_RUNTIME_PASSWORD
$env:SAAL_DB_MIGRATION_USER = 'saal_migrator'
.\mvnw.cmd -B -ntp test
.\mvnw.cmd spring-boot:run
```

O MySQL tem volume persistente Docker (`saal_mysql_data`); o backend falha ao iniciar se faltarem
configuracoes ou se credenciais de runtime e migration forem iguais. A conta runtime local
conecta sem schema selecionado e sem grants de leitura/escrita; a conta Flyway recebe
privilegios de migration apenas nos schemas configurados. Nenhuma delas e a conta root.
A inicializacao de usuarios ocorre somente em volume vazio;
nao remova um volume existente para reaplicar grants.

**IMPORTANTE:** `docker compose down` para o container sem apagar volume. **Nao** execute
`docker compose down -v`, pois remove o volume e seus dados.

### Verificar conectividade

Em outro terminal PowerShell:

```powershell
Invoke-RestMethod 'http://localhost:8080/actuator/health'
Invoke-RestMethod 'http://localhost:8080/api/v1/system/status'
```

Health deve retornar `UP`; o Actuator verifica tambem a conexao quando o `DataSource` esta ativo.
Nao envia senha, nomes de banco ou detalhes internos na resposta publica.

## Testes

```powershell
.\mvnw.cmd -B -ntp test
# Com Docker Desktop ativo:
.\mvnw.cmd -B -ntp -Pdb-integration verify
```

`test` usa banco H2 **somente para testes basicos** e preserva os testes da API I2.
O teste `MySqlFlywayIT` usa Testcontainers com MySQL 8.4 verdadeiro; cria uma tabela
**APENAS em test/resources**, conferindo a migration do Flyway, credenciais separadas,
privilegios limitados, upgrade com preservacao de dados sinteticos e backup/restauracao em
schema isolado.
O CI executa obrigatoriamente ambos os tipos de teste; o Docker Desktop local e opcional para
os testes unitarios, mas obrigatorio para o teste de integracao.

## Regras de negocio ja implementadas sem inventar campos

- AnimalStatus: AVAILABLE/ADOPTED (I2)
- AdoptionEligibilityPolicy: animal ADOPTED nao recebe interesse (I2)
- AnimalPhotoPolicy: entre 1 e 3 fotos, inclusive (I3)

## O que NAO foi implementado

- Nenhuma tabela real Animal, AnimalImage, AdoptionRequest ou Administrator;
  os campos, a privacidade e o storage continuam pendentes. Nao executar uma migration de
  dados de negocio com suposicoes do prototipo.
- Nao ha endpoint novo `/api/v1/animals` nem POST administrativo inseguro.
- Nao ha upload, envio de interessados, auth, deploy ou armazenamento de PII.
- O frontend React continua separado e seus mocks ainda nao foram removidos.

O ensaio de backup/restauracao e somente mecanico e usa dados sinteticos num container
descartavel. Consulte [`docs/mysql-backup-restore.md`](docs/mysql-backup-restore.md) para
o procedimento validado e os gates operacionais antes de qualquer dado real.

## Quando as regras da ONG forem destravadas

Adicionar migrations de negocio em `src/main/resources/db/migration` somente apos aprovacao
dos campos/modelo, com FK/indices/restricoes e testes MySQL. O registro atual ainda nao aprova
schema de produto. Nunca usar `ddl-auto=update` para schema em producao.

## Referencias de escopo

- `../specs/decisions/I1-approval-register.md`
- `../openspec/changes/saal-functional-readiness/tasks.md`
- `../docs/quality/RELEASE_GATES.md`
