# Checklist de revisão de segurança

Use antes de implementar para definir escopo e novamente após cada mudança relevante. Marque
itens como não aplicáveis somente com justificativa. Uma instrução ou checklist não prova que
um controle técnico está implementado.

## Antes da alteração

- [ ] Li `AGENTS.md`, `specs/README.md`, a feature, ADRs e políticas relacionadas.
- [ ] Confirmei no código o estado atual e não descrevi protótipo, mock ou contrato como
  funcionalidade operacional.
- [ ] Identifiquei dados tratados, fronteiras de confiança, atores, permissões e possíveis
  impactos LGPD.
- [ ] Identifiquei se a mudança envolve autenticação, sessão, autorização, dados de outros
  usuários, upload, SQL, dependências, logs ou migration.
- [ ] Não há regra de segurança necessária marcada `PENDENTE DE DECISÃO` sendo inventada.

## Entrada, saída e dados

- [ ] Entradas são validadas no ponto de entrada e no servidor; tamanho, formato, limites e
  valores permitidos são explícitos.
- [ ] Consultas ao banco são parametrizadas ou via ORM seguro; não há concatenação insegura.
- [ ] Dados exibidos são escapados pelo contexto; HTML rico/URLs usam sanitização e allowlist
  justificadas. Não há inserção perigosa no DOM.
- [ ] Respostas e erros não expõem stack trace, segredo, SQL, dados pessoais ou configuração.
- [ ] Só são coletados e registrados dados pessoais necessários; retenção e finalidade estão
  definidas quando aplicável.

## Identidade, autorização e abuso

- [ ] Autenticação e credenciais são verificadas no servidor; senhas usam hash apropriado.
- [ ] Sessões/tokens têm proteção, expiração, rotação/revogação e logout efetivo definidos.
- [ ] CSRF foi avaliado de acordo com o mecanismo de autenticação.
- [ ] Toda operação de leitura/criação/atualização/exclusão verifica papel e acesso ao
  recurso no servidor; acesso a dados de outros usuários não é possível.
- [ ] Rotas e endpoints administrativos estão protegidos no servidor, não só na interface.
- [ ] Login e endpoints sensíveis têm mitigação de força bruta e abuso.
- [ ] Cookies, CORS, HTTPS e headers estão restritos à implantação necessária.

## Arquivos, configuração e cadeia de suprimentos

- [ ] Uploads (se houver) validam allowlist, tamanho, conteúdo e armazenamento seguro.
- [ ] Não foi adicionado segredo; variáveis `VITE_*` contêm somente valores públicos.
- [ ] Logs não incluem senha, token, cookie ou dados pessoais desnecessários.
- [ ] Dependências e lockfile foram revisados; auditoria aplicável foi executada ou a ausência
  de ferramenta foi registrada.
- [ ] Migration é versionada, reversível quando viável e não destrutiva sem autorização.
- [ ] Configuração CORS/headers não permite origens ou recursos além do necessário.

## Validação, revisão e conclusão

- [ ] Foram adicionados/atualizados testes para controles críticos afetados.
- [ ] Foram executados typecheck, testes, lint, build e auditorias disponíveis pertinentes;
  resultados e comandos são reportados sem extrapolar.
- [ ] Revisão de segurança foi concluída; autenticação, permissões, migration e dados
  sensíveis receberam revisão apropriada.
- [ ] Pull request explica risco, validações, limitações e plano operacional pertinente.
- [ ] Riscos residuais, decisões pendentes e controles ainda não automatizados estão
  registrados. Nenhuma proteção de branch/GitHub é presumida como ativa.
