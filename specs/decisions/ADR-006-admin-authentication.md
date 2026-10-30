# ADR-006: Autenticação administrativa inicial

- **Status:** Aceito para implementação limitada, sem autorização de deploy.
- **Data:** 2026-10-29.
- **Evidência:** decisões explícitas do responsável técnico na solicitação de implementação
  de autenticação administrativa. Nenhuma decisão de negócio pendente da ONG é inferida.

## Contexto

O painel React precisa validar identidade no backend e proteger rotas administrativas sem
depender de estado local, credenciais no bundle ou autenticação demonstrativa. Há um único
administrador, sem papéis diferenciados. O modelo de identidade, lifecycle, recuperação e
hosting de produção não está decidido pela ONG.

## Decisões

1. **Credencial única provisionada externamente:** o serviço recebe
   `SAAL_ADMIN_USERNAME` e `SAAL_ADMIN_PASSWORD_HASH` no ambiente. Não há usuário ou senha
   padrão, autoinscrição, criação de conta na API ou persistência de administrador no banco.
   O hash deve ter prefixo `{bcrypt}` e fator entre 12 e 16; o utilitário interativo usa
   BCrypt 12 e não imprime a senha.
2. **Sessão server-side:** usar `HttpSession`, trocar o identificador após autenticação,
   encerrar no logout e expirar após 15 minutos de inatividade. Frontend e API devem ser
   same-site, com proxy no caminho da API. O proxy Vite local aponta para o backend; proxy de
   produção ainda não foi provisionado.
3. **Proteções de browser:** cookie de sessão `HttpOnly`, `SameSite=Lax` e `Secure=true` por
   padrão. CSRF permanece habilitado com token mantido no servidor e enviado no header
   `X-CSRF-TOKEN`. CORS fica fechado por padrão e aceita somente origens HTTP(S) exatas
   explicitamente configuradas; CORS não substitui autenticação nem autorização.
4. **Limite de login:** 10 falhas por endereço IP em 10 minutos acionam bloqueio de 15
   minutos. A resposta limitada inclui `Retry-After`. Isso não define limites para formulários
   públicos, que permanecem pendentes por ONG-09.
5. **Autorização:** `/api/v1/admin/**` exige a autoridade server-side `ROLE_ADMIN`. A rota
   React protegida é apenas UX; endpoints de domínio devem manter autorização no servidor.

## Consequências e limites

- O armazenamento de sessão e o limitador são locais ao processo. Esta implementação suporta
  uma única instância: reinício invalida sessões e réplicas não compartilham sessão nem
  contadores. Spring Session/JDBC ou outra topologia exige decisão e validação próprias.
- A configuração de desenvolvimento pode desligar `Secure` explicitamente para HTTP local;
  o default de produção permanece `true`. Produção exige HTTPS e um proxy same-site real.
- `request.getRemoteAddr()` é a fonte de IP e headers encaminhados não são confiados.
  Configuração de proxy confiável, domínio, secret store, rotação de credencial, recuperação,
  monitoramento e produção continuam pendentes.
- Nenhum endpoint administrativo de domínio, cadastro de animais ou acesso a solicitações é
  criado por este ADR. O OpenAPI documenta o contrato de sessão separado desses recursos.
- A senha não é armazenada no frontend ou em storage do navegador. Recuperação de senha e
  alteração administrativa permanecem indisponíveis até decisão e integração próprias.

## Alternativas rejeitadas nesta etapa

- JWT/bearer persistente no navegador: ciclo de vida e revogação não aprovados; não usar o
  placeholder anterior do OpenAPI.
- Cookies cross-site ou autenticação entre sites: não aprovados nem testados.
- Credencial/admin gravados em banco: exigiria schema e lifecycle de identidade ainda não
  aprovados.
