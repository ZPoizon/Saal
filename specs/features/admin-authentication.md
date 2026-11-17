# AUTH-001 — Autenticação administrativa

## 1. Identificador e nome

`AUTH-001` — Autenticar e encerrar sessão administrativa.

## 2. Objetivo

Restringir operações administrativas a pessoas autorizadas.

## 3. Atores

Administrador SAAL.

## 4. Pré-condições

Somente um administrador, provisionado por username e hash fornecidos à configuração do
backend fora do repositório. Não existe cadastro público nem credencial padrão.

## 5. Regras de negócio

- Credenciais nunca podem ficar no código ou ser comparadas no navegador.
- Senhas devem ser armazenadas somente como hash adequado.
- Operações administrativas exigem autorização no servidor.
- Há um único administrador; não há papéis diferenciados (ONG-01, parcial).
- A abordagem técnica aprovada em `specs/decisions/ADR-006-admin-authentication.md` usa
  sessão server-side, SPA/API same-site via proxy e expiração após 15 minutos de inatividade.
- Provisionamento técnico usa `SAAL_ADMIN_USERNAME` e `SAAL_ADMIN_PASSWORD_HASH`; o backend
  falha ao iniciar se estiverem ausentes/inválidos. O hash é BCrypt (fator 12–16).
- Identidade nominal e recuperação/rotação de credenciais continuam pendentes (ONG-01);
  secret manager, hosting e operação de produção também continuam pendentes (TEC-09).
- A sessão e o limite de tentativas são locais a uma única instância; alta disponibilidade ou
  múltiplas réplicas não estão suportadas neste incremento.

## 6. Fluxo principal

1. Administrador informa identificador e senha.
2. Backend valida credenciais.
3. Backend regenera o identificador e estabelece sessão segura com cookie `HttpOnly`,
   `Secure` por padrão e `SameSite=Lax`; o frontend não persiste credenciais ou token.
4. Administrador acessa o painel.
5. Logout invalida/encerra a sessão e retorna à tela de entrada.

## 7. Fluxos alternativos

- Credenciais inválidas: resposta genérica sem revelar qual campo falhou.
- Após 10 falhas de login do mesmo IP em 10 minutos, bloquear novas tentativas por 15 minutos.
- Sessão expirada após 15 minutos sem atividade: bloquear operação e solicitar novo login.
- Indisponibilidade do backend: informar erro sem conceder acesso.
- Recuperação/alteração de senha: não implementadas.

## 8. Critérios de aceitação

- **Dado** credenciais válidas, **quando** autenticar, **então** uma sessão autorizada será
  criada sem expor senha.
- **Dado** credenciais inválidas, **quando** autenticar, **então** o acesso será negado.
- **Dado** usuário não autenticado, **quando** chamar endpoint administrativo, **então**
  receberá 401/403.
- **Dado** sessão ativa, **quando** sair, **então** operações posteriores serão bloqueadas.
- **Dado** um visitante sem sessão, **quando** chamar `/api/v1/admin/**`, **então** receberá
  `401`; uma identidade autenticada sem autoridade administrativa recebe `403`.
- **Dado** uma requisição de alteração sem token CSRF válido, **quando** chegar ao backend,
  **então** será rejeitada.

## 9. Dados necessários

Identificador e hash configurados por ambiente; nenhum registro de administrador é persistido
em banco. Não há permissões/papéis diferenciados. Identidade nominal, lifecycle e recuperação
permanecem pendentes (ONG-01).

## 10. Contratos de API relacionados

Implementados nesta branch: `GET /api/v1/auth/csrf`, `GET /api/v1/auth/session`,
`POST /api/v1/auth/login` e `POST /api/v1/auth/logout`. O login/logout exige token CSRF no
header `X-CSRF-TOKEN`; credenciais de login usam formulário `application/x-www-form-urlencoded`.
Ver `specs/contracts/openapi.yaml` e ADR-006.

## 11. Validações

Campos obrigatórios, limites de entrada e credenciais validadas no servidor.

## 12. Requisitos de segurança

HTTPS, hash BCrypt, limite de login aprovado, menor privilégio, respostas genéricas,
proteção contra fixação/CSRF, cookies `HttpOnly/Secure/SameSite` e headers defensivos. O
histórico administrativo detalhado não é requisito (ONG-08); escopo e retenção dos logs
continuam pendentes. Operação de produção requer HTTPS e proxy same-site real.

## 13. Cenários de teste

- login válido/inválido;
- limite de tentativas e CORS allowlist;
- expiração e logout;
- rota e API sem sessão;
- credenciais ausentes;
- ausência de senha/token em logs e storage inseguro;
- CSRF válido/inválido e cookie/headers de segurança.

## 14. Definição de pronto

Backend e proteção de rotas/endpoints implementados, revisão de segurança, testes de
integração, segredos externos ao código e documentação operacional aprovada.

## 15. Estado atual

**Implementado nesta branch de integração:** backend de autenticação/autorização por sessão e
integração React do login, validação de sessão e logout. A disponibilidade do serviço,
provisionamento de credenciais, banco e deploy de produção não foram confirmados. Esta
autenticação protege as operações administrativas existentes; não implica que configurações
do site tenham API ou persistência compartilhada.
