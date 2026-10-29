# AUTH-001 — Autenticação administrativa

## 1. Identificador e nome

`AUTH-001` — Autenticar e encerrar sessão administrativa.

## 2. Objetivo

Restringir operações administrativas a pessoas autorizadas.

## 3. Atores

Administrador SAAL.

## 4. Pré-condições

Administrador ativo cadastrado no backend futuro.

## 5. Regras de negócio

- Credenciais nunca podem ficar no código ou ser comparadas no navegador.
- Senhas devem ser armazenadas somente como hash adequado.
- Operações administrativas exigem autorização no servidor.
- Há um único administrador; não há papéis diferenciados (ONG-01, parcial).
- Identidade, provisionamento, revogação, recuperação, sessão/token, duração e bloqueio:
  `PENDENTE DE DECISÃO`.

## 6. Fluxo principal

1. Administrador informa identificador e senha.
2. Backend valida credenciais.
3. Sistema estabelece sessão segura.
4. Administrador acessa o painel.
5. Logout invalida/encerra a sessão e retorna à tela de entrada.

## 7. Fluxos alternativos

- Credenciais inválidas: resposta genérica sem revelar qual campo falhou.
- Sessão expirada: bloquear operação e solicitar novo login.
- Indisponibilidade do backend: informar erro sem conceder acesso.
- Recuperação de senha: não definida.

## 8. Critérios de aceitação

- **Dado** credenciais válidas, **quando** autenticar, **então** uma sessão autorizada será
  criada sem expor senha.
- **Dado** credenciais inválidas, **quando** autenticar, **então** o acesso será negado.
- **Dado** usuário não autenticado, **quando** chamar endpoint administrativo, **então**
  receberá 401/403.
- **Dado** sessão ativa, **quando** sair, **então** operações posteriores serão bloqueadas.

## 9. Dados necessários

Identificador, hash de senha, estado e timestamps. Não há permissões/papéis diferenciados.
Modelo exato, lifecycle e provisionamento pendentes (ONG-01).

## 10. Contratos de API relacionados

Planejado: `POST /admin/session` e `DELETE /admin/session`; protocolo, renovação e topologia
dependem da decisão de sessão.

## 11. Validações

Campos obrigatórios, limites de entrada e credenciais validadas no servidor.

## 12. Requisitos de segurança

HTTPS, hash forte, rate limiting, menor privilégio, proteção contra enumeração/fixação/CSRF
conforme mecanismo, cookies `HttpOnly/Secure/SameSite` se usados, rotação e logs mínimos de
segurança. Histórico administrativo detalhado não é requisito (ONG-08); escopo e retenção dos
logs continuam pendentes.

## 13. Cenários de teste

- login válido/inválido;
- usuário inativo;
- rate limiting;
- expiração e logout;
- rota e API sem sessão;
- credenciais ausentes;
- ausência de senha/token em logs e storage inseguro.

## 14. Definição de pronto

Backend e proteção de rotas/endpoints implementados, revisão de segurança, testes de
integração, segredos externos ao código e documentação operacional aprovada.

## 15. Estado atual

**Protótipo inseguro.** `Admin.tsx` compara `admin`/`saal2026` no cliente e guarda login
somente em estado React. A rota `/admin` não possui proteção real.
