# SAAL API — fundação, MySQL/Flyway e autenticação administrativa

O backend é um servidor HTTP Spring Boot 4.1.2 com Java 21. Esta árvore integra:

- fundação HTTP, health check e tratamento sanitizado de erros (I2);
- MySQL 8.4, Flyway e separação entre credenciais de runtime e de migration (I3);
- autenticação administrativa com sessão server-side, CSRF, CORS, rate limit e autorização
  para `/api/v1/admin/**` (I4);
- catálogo de animais persistido (`animal` e `animal_photo`), com CRUD administrativo e
  leitura pública;
- manifestações de interesse persistidas em `animal_interest`, com envio público e consultas
  administrativas protegidas.

Ainda **não** existem upload de arquivos (as fotos são referências/URLs), solicitações de
adoção com workflow nem mensagens automáticas. O intake armazena os campos definidos para
contato; finalidade/base legal e retenção continuam pendentes, portanto não operar com dados
reais até resolução desses pontos.

## Preparação

- JDK 21 ativo (`java -version` e `javac -version`)
- Docker Desktop aberto e integrado ao Windows, ou um MySQL 8 acessível
- PowerShell e acesso ao Maven Central para baixar dependências
- Node 22 e pnpm 10 para o frontend na raiz do projeto

### Windows: iniciar MySQL local com Docker

Em PowerShell, use senhas pessoais SOMENTE locais. Não publique em commit, logs ou screenshots:

```powershell
cd C:\Users\nezio\IdeaProjects\Saal\backend
$env:SAAL_DB_RUNTIME_PASSWORD = Read-Host 'Senha runtime local'
$env:SAAL_DB_MIGRATION_PASSWORD = Read-Host 'Senha de migration local'
$env:SAAL_DB_ROOT_PASSWORD = Read-Host 'Senha root somente local'
docker compose -f compose.dev.yaml up -d
docker compose -f compose.dev.yaml ps
```

O MySQL é publicado em `127.0.0.1:3307` para não conflitar com uma instalação local em 3306.
O volume `saal_mysql_data` é persistente. A inicialização dos usuários ocorre somente em
volume vazio; não remova um volume existente para reaplicar grants.

**IMPORTANTE:** `docker compose down` para o container sem apagar o volume. **Não** execute
`docker compose down -v`, pois isso remove o volume e seus dados.

### Configurar o backend

```powershell
cd C:\Users\nezio\IdeaProjects\Saal\backend
$env:SAAL_DB_RUNTIME_URL = 'jdbc:mysql://127.0.0.1:3307/saal'
$env:SAAL_DB_MIGRATION_URL = 'jdbc:mysql://127.0.0.1:3307/saal'
$env:SAAL_DB_USER = 'saal_runtime'
$env:SAAL_DB_PASSWORD = $env:SAAL_DB_RUNTIME_PASSWORD
$env:SAAL_DB_MIGRATION_USER = 'saal_migrator'
$env:SAAL_ADMIN_USERNAME = 'admin'
$env:SAAL_ADMIN_PASSWORD_HASH = '{bcrypt}...'
$env:SAAL_SESSION_COOKIE_SECURE = 'false'
.\mvnw.cmd spring-boot:run
```

O backend falha ao iniciar se faltarem configurações, se runtime e migration usarem a mesma
identidade ou se a credencial administrativa for inválida. Nenhuma conta root é usada pela
aplicação. A conta runtime não recebe grants de schema; a conta Flyway recebe somente os
privilégios necessários para migrations.

Se a porta 8080 estiver ocupada, configure `$env:PORT="8081"` antes de `spring-boot:run`.

## Credencial administrativa

Configure `SAAL_ADMIN_USERNAME` e `SAAL_ADMIN_PASSWORD_HASH` no ambiente de execução ou no
secret manager. Não há credenciais padrão, cadastro público, senha embutida no frontend ou
conta persistida no banco.

Para gerar o hash interativamente:

```powershell
.\mvnw.cmd -B -ntp -DskipTests package
java -jar .\target\saal-api-0.1.0-SNAPSHOT.jar --generate-admin-password-hash
```

O comando solicita e confirma a senha sem exibi-la; copie somente o hash impresso para o
secret manager como `SAAL_ADMIN_PASSWORD_HASH`. Não passe a senha na linha de comando e não
grave o hash em arquivos versionados. O gerador usa BCrypt fator 12; fatores de 12 a 16 são
aceitos.

Em desenvolvimento HTTP local, configure explicitamente `SAAL_SESSION_COOKIE_SECURE=false`;
o padrão permanece `true` e deve ser mantido em HTTPS. Configure `SAAL_CORS_ALLOWED_ORIGINS`
somente com origens exatas HTTP(S) se a API for chamada diretamente de outra origem. A rota
preferida do browser é same-site via proxy; a configuração Vite `/api` aponta por padrão para
`http://localhost:8080`.

As sessões e os bloqueios de login vivem na memória de uma instância. Reiniciar invalida
sessões e múltiplas réplicas não são suportadas nesta etapa.

## Verificar conectividade

Em outro terminal PowerShell:

```powershell
Invoke-RestMethod 'http://localhost:8080/actuator/health'
Invoke-RestMethod 'http://localhost:8080/api/v1/system/status'
Invoke-RestMethod 'http://localhost:8080/api/v1/auth/session'
```

Respostas esperadas:

- `GET /actuator/health` → `200` e `{"status":"UP"}`
- `GET /api/v1/system/status` → `200` e `{"service":"saal-api","status":"RUNNING"}`
- `GET /api/v1/auth/session` → `200` e `{"authenticated":false}` sem sessão
- `GET /api/v1/animals` → `200` com um array JSON dos animais disponíveis
- `GET /api/v1/animals/{id}` → `200` com o animal ou `404` quando não existe

## Testes e build

```powershell
.\mvnw.cmd -B -ntp test
# Com Docker Desktop ativo:
.\mvnw.cmd -B -ntp -Pdb-integration verify
```

`test` usa H2 em modo MySQL e cobre domínio, API I2, autenticação, autorização e o CRUD de
animais (`AnimalApiHttpTest`). O teste `MySqlFlywayIT` usa Testcontainers com MySQL 8.4 real
para conferir Flyway, credenciais separadas, privilégios limitados, upgrade com preservação
de dados sintéticos e backup/restauração em schema isolado.

O CI executa obrigatoriamente os testes unitários e o perfil `db-integration`; Docker local
é opcional para os testes unitários, mas obrigatório para o teste de integração.

## Regras de negócio já implementadas sem inventar campos

- `AnimalStatus`: `AVAILABLE`/`ADOPTED` (I2)
- `AdoptionEligibilityPolicy`: animal `ADOPTED` não recebe interesse (I2)
- `AnimalPhotoPolicy`: entre 1 e 3 fotos, inclusive (I3)

## O que NÃO foi implementado

- Upload e armazenamento de arquivos de imagem: as fotos são URLs (`animal_photo`), sem
  storage próprio; a solução definitiva segue pendente (ONG-06).
- Workflow de adoção, cadastro de interessados, mensagens automáticas e gerenciamento de
  consentimento/retencao.
- Deploy, envio de interessados e armazenamento de PII.
- A integração MySQL real depende de executar `.\mvnw.cmd -B -ntp -Pdb-integration verify`;
  a implantação e a API disponível fora do ambiente local não são presumidas.

O ensaio de backup/restauração é somente mecânico e usa dados sintéticos em container
descartável. Consulte [`docs/mysql-backup-restore.md`](docs/mysql-backup-restore.md) para o
procedimento validado e os gates operacionais antes de qualquer dado real.

## Estrutura relevante

- `system/SystemStatusController`: endpoint técnico de comprovação HTTP.
- `domain/AnimalStatus`: estados `AVAILABLE`, `ADOPTED` informados pela ONG.
- `domain/AdoptionEligibilityPolicy`: regra de não aceitar interesse por animal adotado.
- `domain/AnimalPhotoPolicy`: limite de 1 a 3 fotos.
- `animal/`: entidade, repositório, serviço, DTOs e controllers público/administrativo.
- `src/main/resources/db/migration/V1__create_animal_catalog.sql`: schema `animal`/`animal_photo`.
- `src/main/resources/db/migration/V2__create_animal_interest.sql`: interesse associado a
  animal; V1 permanece imutável.
- `database/DatabaseCredentialSeparationValidator`: impede reutilização de credenciais.
- `error/GlobalErrorHandler`: resposta sanitizada para exceções não previstas.
- `auth/`: sessão, CSRF, credencial BCrypt, rate limit e autorização server-side.
- `src/test`: testes de domínio, HTTP, autenticação, autorização, CSRF, CORS e expiração.
- `compose.dev.yaml` e `docker/mysql/init`: MySQL local e usuários separados.

## Quando as regras da ONG forem destravadas

Novas migrations devem seguir em `src/main/resources/db/migration`, com FK, índices,
restrições e testes MySQL. O schema atual preserva o protótipo, mas ainda depende de
aprovação de campos/modelo (ONG-05/ONG-10). Nunca usar `ddl-auto=update` para schema em
produção.

## Referências de escopo

- `../specs/decisions/I1-approval-register.md`
- `../specs/decisions/ADR-006-admin-authentication.md`
- `../openspec/changes/saal-functional-readiness/tasks.md`
- `../docs/quality/RELEASE_GATES.md`

O projeto usa Maven Wrapper fixado com verificação de integridade no layout `.mvn/wrapper/`.
A distribuição Maven é publicada pela Apache Software Foundation.
