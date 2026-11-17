# Deploy de demonstração: Vercel + Render + Aiven

- **Status:** configuração preparada no repositório; **nenhum deploy executado, autorizado
  ou validado** em produção. Este documento é um roteiro de protótipo.
- **Data:** 2026-11-16.
- **Escopo:** publicar o frontend React na Vercel e a API Spring Boot em um host de containers,
  com MySQL gerenciado, mantendo o cookie de sessão same-site via proxy `/api`.
- **Dados:** usar somente dados sintéticos. As decisões de LGPD, retenção e finalidade
  continuam pendentes e impedem operação com dados reais.

## Topologia

```
Navegador
  │  https://<projeto>.vercel.app
  ▼
Vercel (arquivos estáticos de dist/)
  │  rewrite /api/*  →  proxy same-origin
  ▼
Render Web Service (imagem Docker de backend/)
  │  JDBC TLS
  ▼
Aiven MySQL (schema saal)
```

O frontend chama caminhos relativos (`/api/v1/...`), então no navegador tudo é same-origin.
É isso que faz o cookie `JSESSIONID` (SameSite=Lax, Secure) funcionar na Vercel.

## 1. MySQL no Aiven

1. Criar um serviço **MySQL** (plano free, região próxima do Render).
2. No console SQL do Aiven, conectar como `avnadmin` e executar, trocando as senhas:

   ```sql
   CREATE DATABASE IF NOT EXISTS saal;

   CREATE USER 'saal_runtime'@'%' IDENTIFIED BY '<SENHA_RUNTIME>';
   CREATE USER 'saal_migrator'@'%' IDENTIFIED BY '<SENHA_MIGRATION>';

   GRANT SELECT, INSERT, UPDATE, DELETE ON saal.* TO 'saal_runtime'@'%';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES, SHOW VIEW, TRIGGER
       ON saal.* TO 'saal_migrator'@'%';

   FLUSH PRIVILEGES;
   ```

3. Anotar host e porta (o Aiven usa porta alta, por exemplo `12345`). O MySQL do Aiven exige
   TLS; o backend usará `sslMode=REQUIRED`.

> `saal_runtime` recebe apenas DML. `saal_migrator` recebe DDL para o Flyway. Não configurar
> `root`/`avnadmin` na aplicação.

## 2. API no Render

1. **New → Web Service → Build and deploy from a Git repository**.
2. Selecionar o repositório e a branch `main`.
3. Configurar:
   - **Language/Runtime:** Docker
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile`
   - **Instance Type:** Free
   - **Health Check Path:** `/actuator/health`
   - **Auto-Deploy:** Yes
4. Variáveis de ambiente (valores secretos apenas no painel do Render):

   | Variável | Valor |
   |---|---|
   | `SAAL_DB_RUNTIME_URL` | `jdbc:mysql://<HOST>:<PORTA>/saal?sslMode=REQUIRED` |
   | `SAAL_DB_USER` | `saal_runtime` |
   | `SAAL_DB_PASSWORD` | senha de runtime |
   | `SAAL_DB_MIGRATION_URL` | mesma URL acima |
   | `SAAL_DB_MIGRATION_USER` | `saal_migrator` |
   | `SAAL_DB_MIGRATION_PASSWORD` | senha de migration |
   | `SAAL_ADMIN_USERNAME` | usuário administrador |
   | `SAAL_ADMIN_PASSWORD_HASH` | hash BCrypt gerado no passo 3 |
   | `SAAL_SESSION_COOKIE_SECURE` | `true` |
   | `SAAL_CORS_ALLOWED_ORIGINS` | deixar vazio |
   | `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=70` |

   **Não** definir `PORT`: o Render informa a porta e `application.yml` já lê `${PORT:8080}`.
5. O Flyway aplica as migrations no primeiro start, usando a conta de migration.
6. Anotar a URL pública, por exemplo `https://saal-api.onrender.com`.

## 3. Gerar o hash da senha administrativa

Executar localmente, em terminal interativo (a senha não aparece no histórico):

```powershell
cd backend
.\mvnw.cmd -B -ntp -DskipTests package
java -jar target\saal-api-0.1.0-SNAPSHOT.jar --generate-admin-password-hash
```

Copiar a saída (`{bcrypt}$2a$12$...`) para `SAAL_ADMIN_PASSWORD_HASH` no Render. Não commitar
o hash nem a senha.

## 4. Vercel

O projeto já está conectado ao GitHub e publica automaticamente a cada push/PR.

1. Em **Settings → Build & Development Settings**, confirmar:
   - **Root Directory:** vazio (raiz do repositório)
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
2. Editar `vercel.json` e trocar `https://saal-api.onrender.com` pela URL real do Render.
3. Não há variáveis `VITE_*` com segredo: o frontend só conhece caminhos relativos.
4. O rewrite `/api/:path*` faz proxy para o Render; o rewrite final entrega `index.html`
   para rotas do React Router (`/animais/1`, `/admin`, ...).
5. O header `x-vercel-enable-rewrite-caching: 0` impede que respostas autenticadas sejam
   cacheadas no CDN.

## 5. Verificação

```bash
curl -i https://<projeto>.vercel.app/api/v1/animals
curl -i https://<projeto>.vercel.app/api/v1/auth/session
```

Esperado: `200` com `[]` e `{"authenticated":false}`; depois, login em `/admin` e um cadastro
de animal sintético. Verificar também que um deep link (`/animais`) abre direto, sem 404.

## 6. Limitações e pendências conhecidas

- **Cold start:** o Render Free suspende após ~15 min sem tráfego e pode levar ~1 min para
  responder. A primeira chamada pode falhar e exibir “Não foi possível validar a sessão”.
  Isso é indisponibilidade do host, não sessão inválida.
- **Sessão em memória:** reinício, deploy ou spin-down encerram as sessões administrativas;
  múltiplas réplicas não são suportadas. Spring Session JDBC não está habilitado.
- **Rate limit por IP:** `LoginRateLimitFilter` e o limite de interesses usam
  `request.getRemoteAddr()`. Atrás de Render/Vercel, todos os visitantes podem compartilhar o
  mesmo IP de proxy, fazendo tentativas alheias bloquearem o login administrativo. Corrigir
  exige decisão sobre confiar em `X-Forwarded-For` (risco de spoofing) e revisão de segurança.
- **Sem segredo de origem:** a API do Render continua publicamente acessível fora do proxy da
  Vercel. O segredo proxy→API previsto no ADR-004 não foi implementado.
- **TLS:** `sslMode=REQUIRED` cifra a conexão, mas não valida a identidade do certificado do
  Aiven (`VERIFY_IDENTITY` exigiria truststore com a CA). Pendente de revisão.
- **Preview da Vercel:** cada PR gera um deployment de frontend, mas todos apontam para o
  mesmo backend de produção; previews de backend no Render não fazem parte do plano free.
- **Script local:** `backend/docker/mysql/init/10-create-users.sh` cria `saal_runtime` sem
  GRANT. Em volume Docker novo o backend falha com `Access denied`; conceder DML manualmente
  (como acima) até o script ser corrigido.
- **Dados reais:** bloqueados enquanto finalidade/base legal, retenção e política de privacidade
  não forem aprovadas.
