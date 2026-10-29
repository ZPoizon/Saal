# SAAL API — incremento I2 (fundacao executavel)

O backend e **real** e executa um servidor HTTP Spring Boot 4.1.2 com Java 21. Ainda **nao** tem banco,
login, CRUD de animais nem formulario de interesse. Esses recursos dependem de decisoes e incrementos
I3–I10 do OpenSpec. Nenhuma confirmacao falsa nem armazenamento de dados pessoais foi implementado.

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

Respostas esperadas (o servidor precisa estar no ar):
- `GET /actuator/health` → `200` e `{"status":"UP"}`
- `GET /api/v1/system/status` → `200` e `{"service":"saal-api","status":"RUNNING"}`
- `GET /api/v1/animals` → `404` (nao implementado; nao existe catalogo falso)

Se a porta 8080 estiver ocupada, configure `$env:PORT="8081"` antes de `spring-boot:run`.

## Testes e build

```powershell
.\mvnw.cmd -B -ntp verify
.\mvnw.cmd -B -ntp package
java -jar target/saal-api-0.1.0-SNAPSHOT.jar
```

Na raiz do SAAL, `pnpm dev` continua executando o frontend em outra porta. A integracao React↔API
**nao existe ainda**; apenas iniciar os dois processos nao os conecta.

## Docker (opcional)

```bash
cd backend
docker build -t saal-api:i2 .
docker run --rm -p 8080:8080 saal-api:i2
```

A configuracao nao usa banco e nao deve ser publicada como aplicacao de adocao pronta. `PORT` e a unica
variavel necessaria atualmente. Nenhuma senha, token ou dado pessoal deve entrar no codigo ou logs.

## Arquivos essenciais

- `system/SystemStatusController`: endpoint tecnico de comprovacao HTTP.
- `domain/AnimalStatus`: estados `AVAILABLE`, `ADOPTED` informados pela ONG.
- `domain/AdoptionEligibilityPolicy`: regra verdadeira de nao aceitar interesse por animal adotado.
- `error/GlobalErrorHandler`: resposta sanitizada para excecoes nao previstas.
- `application.yml`: health, erros e porta configuravel.
- `src/test`: tres testes da regra de dominio, tres testes HTTP reais e um teste de erro sanitizado.

## Verificacoes antes de aceitar I2

- Build/testes locais em ambiente com Maven Central disponivel e JDK 21.
- GitHub Actions backend verde apos PR (arquivo `.github/workflows/backend-quality.yml`).
- Health e status verificados via HTTP local (e log limpo).
- Conferir OpenSpec tasks 3.1–3.3, atualizar contrato/documentacao se necessario, sem declarar I2
  concluido apenas por compilar.

## O que fica explicitamente fora desta entrega

- Spring Security: entra na fase de autenticacao autorizada (I4), nao criar admin ficticio.
- Spring Data JPA/MySQL/Flyway: entram em I3 quando modelo, campos e policies forem aprovados.
- Catalogo persistente e solicitacoes: I5–I9, apos definicoes de dados e privacidade.
- Hosting, cookies e CORS: precisam de topologia aprovada; nada sera exposto automaticamente.

O projeto usa inicializadores Maven fixados 3.9.11 com verificacao de integridade e configuracao no
layout `.mvn/wrapper/`. A distribuicao Maven e publicada pela Apache Software Foundation.
