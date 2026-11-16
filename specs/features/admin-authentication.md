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
- Sessão/token, duração, bloqueio, recuperação e perfis: `PENDENTE DE DECISÃO`.

## 6. Fluxo principal

1. Administrador informa identificador e senha.
2. No formulário, administrador pode alternar entre exibir e ocultar a senha digitada.
3. Backend valida credenciais.
4. Sistema estabelece sessão segura.
5. Administrador acessa o painel.
6. Logout invalida/encerra a sessão e retorna à tela de entrada.

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
- **Dado** o formulário de login, **quando** acionar o botão de visibilidade, **então** a
  senha digitada será exibida ou ocultada sem enviar o formulário.

## 9. Dados necessários

Identificador, hash de senha, estado, permissões e timestamps. Modelo exato pendente.

## 10. Contratos de API relacionados

Planejado: `POST /auth/login`; endpoints de logout/renovação dependem da decisão de sessão.

## 11. Validações

Campos obrigatórios, limites de entrada e credenciais validadas no servidor.

## 12. Requisitos de segurança

HTTPS, hash forte, rate limiting, menor privilégio, proteção contra enumeração/fixação/CSRF
conforme mecanismo, cookies `HttpOnly/Secure/SameSite` se usados, rotação e auditoria.

## 13. Cenários de teste

- login válido/inválido;
- usuário inativo;
- rate limiting;
- expiração e logout;
- rota e API sem sessão;
- credenciais ausentes;
- alternância de exibição/ocultação da senha sem envio acidental do formulário;
- ausência de senha/token em logs e storage inseguro.

## 14. Definição de pronto

Backend e proteção de rotas/endpoints implementados, revisão de segurança, testes de
integração, segredos externos ao código e documentação operacional aprovada.

## 15. Estado atual

**Demonstração local sem autenticação.** `Admin.tsx` apresenta um aviso e permite abrir o
painel sem credenciais. A rota `/admin` não possui proteção; todas as pessoas com acesso ao
navegador podem editar configurações e dados locais. O segredo anteriormente comparado no
cliente foi removido, mas isso não implementa autorização. Não usar em produção.
