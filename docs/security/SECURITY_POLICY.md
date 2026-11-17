# Política de segurança

## Objetivo e escopo

Esta política define requisitos para o frontend atual, o backend futuro, o ciclo de
desenvolvimento e os dados da ONG. Usa OWASP ASVS e OWASP Top 10 como referências de risco,
com controles proporcionais ao sistema. Não é uma certificação ASVS nem afirma conformidade
regulatória.

O repositório contém backend Spring Boot com autenticação por sessão, CSRF, autorização
server-side, validação e persistência Flyway/MySQL configurável. Isso não prova deploy,
integração MySQL operacional ou conformidade de produção. Regras de acesso no cliente são
apenas UX; autorização e validação de segurança são aplicadas no servidor. A finalidade,
base legal e retenção dos dados pessoais permanecem pendentes.

## Requisitos para implementação

1. **Injeção e SQL:** validar e normalizar entradas nas fronteiras; usar consultas
   parametrizadas ou ORM seguro. Nunca concatenar entradas em SQL, nomes de colunas,
   ordenação ou comandos. Se algum identificador dinâmico for necessário, mapear valores a
   uma allowlist fixa. Validar também no backend; validação no browser não é uma barreira.
2. **XSS e saída:** tratar dados externos como não confiáveis; usar escaping/contextual
   encoding padrão do React e sanitização apropriada se conteúdo HTML rico for aprovado.
   Evitar `dangerouslySetInnerHTML`, `eval` e construção insegura de URLs/HTML. Validar
   esquemas de links e não inserir conteúdo não confiável em DOM, CSS ou scripts.
3. **CSRF:** quando autenticação usar cookies enviados automaticamente pelo navegador,
   aplicar token anti-CSRF apropriado e validar origem conforme arquitetura; `SameSite` é
   defesa adicional, não substituto universal. Se tokens forem adotados, documentar o
   mecanismo e evitar armazenamento acessível a scripts quando possível.
4. **Autenticação e sessão:** somente no servidor; armazenar senhas com hash adaptativo
   adequado e parâmetros atualizados, nunca reversíveis ou em texto claro. Respostas de
   login devem ser genéricas; proteger contra enumeração e fixação de sessão. Definir
   expiração, rotação e revogação. Logout deve invalidar a sessão/token no servidor e limpar
   o estado do cliente.
5. **Autorização:** verificar no servidor identidade, papel e permissão sobre o recurso em
   toda leitura, criação, atualização e exclusão. Aplicar menor privilégio e negar por
   padrão. Não confiar em IDs, papéis, flags ou guards fornecidos pelo cliente.
6. **Administração e isolamento:** proteger cada endpoint e operação administrativa no
   backend, não somente a rota visual. Verificar propriedade/escopo do recurso para impedir
   IDOR/BOLA e acesso ou alteração de dados pertencentes a outros usuários.
7. **Abuso e força bruta:** limitar tentativas e taxa em login, recuperação e endpoints
   sensíveis; considerar atraso progressivo, limites por conta/origem, monitoramento e
   respostas que não facilitem enumeração. Não impor bloqueios que permitam negação de
   serviço sem análise.
8. **Cookies, tokens e transporte:** usar HTTPS em produção; cookies de sessão devem
   especificar `Secure`, `HttpOnly` e `SameSite` adequados. Definir escopo e duração
   restritos. Não colocar tokens em URLs ou logs. Armazenamento de tokens no browser depende
   de decisão arquitetural e análise de risco.
9. **CORS e headers:** allowlist explícita de origens e métodos necessários; não combinar
   credenciais com origem curinga. Configurar headers adequados ao frontend e implantação,
   incluindo CSP, `frame-ancestors`/proteção contra framing, `X-Content-Type-Options` e
   `Referrer-Policy`. HSTS somente em domínio HTTPS preparado. Evitar política que quebre
   recursos sem avaliar dependências.
10. **Uploads de imagens:** aceitar somente formatos necessários por allowlist; impor limite
    de tamanho, dimensões e frequência; verificar assinatura/conteúdo real sem confiar em
    extensão ou `Content-Type`; gerar nome seguro, impedir execução, armazenar fora da raiz
    pública ou em serviço isolado e servir com tipo correto. Definir processamento e
    retenção antes de ativar uploads.
11. **Erros:** responder com mensagens e códigos previsíveis, sem stack trace, SQL,
    configuração, credenciais ou dados privados. Detalhes diagnósticos ficam em logs
    protegidos e correlacionados sem conteúdo sensível.
12. **Dependências:** manter lockfile; revisar atualizações, origem e avisos de segurança;
    executar auditorias de dependências em desenvolvimento/CI e corrigir ou documentar
    exceções com prazo e responsável. Não adicionar pacote apenas para substituir lógica
    trivial sem justificativa.
13. **Segredos e configuração:** obter segredos por ambiente protegido ou secret manager;
    nunca versionar `.env` real, chaves ou credenciais. `.env.example` contém somente nomes
    e valores não secretos. Tratar toda variável `VITE_*` como pública.
14. **Logs e auditoria:** registrar eventos de segurança necessários com acesso e retenção
    controlados. Não registrar senha, token, cookie, credenciais, conteúdo integral de
    formulários ou dados pessoais desnecessários. Redigir/mascarar identificadores e limitar
    acesso aos logs.
15. **LGPD:** coletar somente dados necessários e com finalidade clara; definir base legal,
    aviso/consentimento quando aplicável, retenção, acesso, correção, exclusão/anonimização,
    compartilhamento e resposta a incidentes antes de operar com dados reais. Não alegar
    conformidade sem revisão jurídica e operacional.
16. **Testes de segurança:** automatizar casos críticos para autenticação, autorização por
    recurso/papel, validação de fronteira, CSRF quando aplicável, uploads, rate limits e
    ausência de vazamento em erros/logs. Testes no frontend não substituem testes de API.
17. **Revisão:** revisar alterações de autenticação, autorização, dados pessoais, uploads,
    dependências, configuração de segurança e migrations antes de considerar concluídas.
    Usar `docs/security/SECURITY_CHECKLIST.md`; escalar riscos não resolvidos.

## Segurança no Git e pull requests

- Não aceitar segredos versionados. Usar secret scanning quando disponível e revisar
  alterações de arquivos de ambiente, exemplos e histórico conforme processo autorizado.
- O CI deve executar typecheck, lint, testes, build, auditoria de dependências e detecção de
  segredos; verificações críticas devem bloquear merge quando a plataforma estiver
  configurada para isso.
- Revisar pull requests por outra pessoa, com descrição do risco, evidências de validação e
  plano de migração/rollback quando aplicável.
- Exigir revisão especializada para autenticação, autorização, migrations e mudanças de
  dados sensíveis. Não realizar migration destrutiva nem exclusão de dados sem autorização
  explícita.
- Recomendar proteção da branch principal, revisão obrigatória e status checks obrigatórios.
  Essas configurações são administrativas do GitHub e não são ativadas por esta política;
  verificar no repositório antes de afirmar que estão ativas.
- O workflow atual `copilot-setup-steps.yml` prepara OpenSpec para o Copilot; não é CI de
  qualidade ou segurança do projeto.

## Referências normativas

- OWASP ASVS: selecionar requisitos aplicáveis e nível de verificação conforme os riscos.
- OWASP Top 10: usar como taxonomia de ameaças, sem substituir modelagem de ameaças.
- Especificações atuais: `specs/README.md`, `specs/features/admin-authentication.md` e
  `specs/architecture/`.
- Controles de revisão: `docs/security/SECURITY_CHECKLIST.md`.
