# SAAL API — incrementos I2/I4 (fundacao e autenticacao)

O backend e **real** e executa um servidor HTTP Spring Boot 4.1.2 com Java 21. A branch de
autenticacao implementa login administrativo com sessao server-side, CSRF e protecao para
`/api/v1/admin/**`. Ainda **nao** tem banco, CRUD de animais nem formulario de interesse. As
mudancas de autenticacao ainda nao foram integradas em `main` ou publicadas.

## Rodar no Windows (PowerShell / IntelliJ)

Abra a pasta `backend/` como projeto Maven, configure o JDK 21 e execute:

```powershell
cd backend
.\mvnw.cmd -B -ntp test
.\mvnw.cmd spring-boot:run
```

O Maven 3.9.11 sera baixado no primeiro uso, com verificacao SHA-512.

Em outro terminal:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
Invoke-RestMethod http://localhost:8080/api/v1/system/status
```

Respostas esperadas (o servidor precisa estar no ar e as credenciais de administrador precisam
estar configuradas):
- `GET /actuator/health` → `200` e `{"status":"UP"}`
- `GET /api/v1/system/status` → `200` e `{"service":"saal-api","status":"RUNNING"}`
- `GET /api/v1/animals` → `404` (nao implementado; nao existe catalogo falso)

Se a porta 8080 estiver ocupada, configure `$env:PORT="8081"` antes de `spring-boot:run`.

## Credencial administrativa

Configure `SAAL_ADMIN_USERNAME` e `SAAL_ADMIN_PASSWORD_HASH` no ambiente de execucao/secret
manager. O servico falha ao iniciar quando qualquer valor esta ausente ou invalido. Nao ha
credenciais padrao, cadastro publico, senha embutida no frontend ou conta persistida no banco.

Para gerar o hash interativamente em um terminal que suporte entrada oculta:

```powershell
.\mvnw.cmd -B -ntp -DskipTests package
java -jar .\target\saal-api-0.1.0-SNAPSHOT.jar --generate-admin-password-hash
```

O comando solicita e confirma a senha sem exibi-la; copie somente o hash impresso para o
secret manager como `SAAL_ADMIN_PASSWORD_HASH`. Nao passe a senha na linha de comando e nao
grave o hash em arquivos versionados. O gerador usa BCrypt fator 12; hashes BCrypt com fator
12–16 sao aceitos.

Em desenvolvimento HTTP local, configure explicitamente `SAAL_SESSION_COOKIE_SECURE=false`;
o default permanece `true` e deve ser mantido em HTTPS. Configure `SAAL_CORS_ALLOWED_ORIGINS`
somente com origens exatas HTTP(S) se a API for chamada diretamente de outra origem. A rota
preferida do browser e same-site via proxy; a configuracao Vite `/api` aponta por default para
`http://localhost:8080`.

## Testes e build

```powershell
.\mvnw.cmd -B -ntp verify
.\mvnw.cmd -B -ntp package
java -jar target/saal-api-0.1.0-SNAPSHOT.jar
```

Na raiz do SAAL, `pnpm dev` continua executando o frontend em outra porta. A integracao React↔API
esta disponivel em branches separadas nesta etapa; iniciar os dois processos na mesma worktree
nao conecta automaticamente o frontend ao backend.

## Docker (opcional)

```bash
cd backend
docker build -t saal-api:i2 .
docker run --rm -p 8080:8080 saal-api:i2
```

A configuracao nao usa banco. `PORT`, credenciais externas e a topologia devem ser configurados
antes de executar o servico; nenhuma senha, token ou dado pessoal deve entrar no codigo ou logs.
As sessoes e os bloqueios de login vivem na memoria de uma instancia: reiniciar invalida sessoes
e multiplas replicas nao sao suportadas.

## Arquivos essenciais

- `system/SystemStatusController`: endpoint tecnico de comprovacao HTTP.
- `domain/AnimalStatus`: estados `AVAILABLE`, `ADOPTED` informados pela ONG.
- `domain/AdoptionEligibilityPolicy`: regra verdadeira de nao aceitar interesse por animal adotado.
- `error/GlobalErrorHandler`: resposta sanitizada para excecoes nao previstas.
- `application.yml`: health, erros e porta configuravel.
- `auth/`: sessao, CSRF, credencial BCrypt, rate limit e autorizacao server-side.
- `src/test`: testes de dominio, HTTP, autenticacao, autorizacao, CSRF, CORS e expiracao.

## Verificacoes antes de aceitar I2

- Build/testes locais em ambiente com Maven Central disponivel e JDK 21.
- GitHub Actions backend verde apos PR (arquivo `.github/workflows/backend-quality.yml`).
- Health e status verificados via HTTP local (e log limpo).
- Conferir OpenSpec tasks 3.1–3.3, atualizar contrato/documentacao se necessario, sem declarar I2
  concluido apenas por compilar.

## O que fica explicitamente fora desta entrega

- Banco, CRUD de animais e solicitacoes continuam fora desta branch.
- Spring Data JPA/MySQL/Flyway: entram em I3 quando modelo, campos e policies forem aprovados.
- Catalogo persistente e solicitacoes: I5–I9, apos definicoes de dados e privacidade.
- Hosting de producao, proxy confiavel, recuperacao de senha e sessao compartilhada entre
  replicas continuam pendentes; nada sera exposto automaticamente.

O projeto usa inicializadores Maven fixados 3.9.11 com verificacao de integridade e configuracao no
layout `.mvn/wrapper/`. A distribuicao Maven e publicada pela Apache Software Foundation.
