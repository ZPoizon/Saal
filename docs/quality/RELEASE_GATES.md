# Gates de prontidão e release do SAAL

Este checklist define evidências requeridas para avançar. Itens não marcados não são
presumidos satisfeitos. A presença deste documento não significa que o sistema esteja
implantado ou apto para produção.

## 1. Estado que deve ser declarado

Para cada mudança/release, indicar separadamente:

- [ ] **Planejado:** descrito em OpenSpec, sem afirmar código implementado.
- [ ] **Implementado:** código presente no commit indicado e revisado.
- [ ] **Testado localmente:** comandos e resultados reproduzíveis registrados.
- [ ] **Validado no CI:** URL/run, commit SHA, job e conclusão observados.
- [ ] **Verificado em ambiente:** ambiente, URL protegida quando aplicável, versão e smoke
  test documentados; não incluir segredos ou PII na evidência.
- [ ] **Aprovado para produção:** responsáveis competentes aprovaram requisitos, dados,
  operação, segurança e plano de recuperação.

Um nível não implica o seguinte. Build não prova integração, CI não prova deploy, e deploy de
demonstração não prova aprovação para produção.

## 2. Gate documental e de escopo (I1)

- [ ] Tarefas 2.1–2.5 do OpenSpec foram avaliadas individualmente e só foram marcadas
  concluídas quando seus critérios e evidências existirem.
- [ ] Decisões de negócio ONG-01–ONG-11 estão aprovadas por autoridade identificada ou
  explicitamente bloqueadas com escopo dependente fora do contrato; nenhuma resposta foi
  inferida.
- [ ] Decisões técnicas aprovadas, condicionais e propostas estão diferenciadas no registro e
  nos ADRs; versões e fontes foram verificadas.
- [ ] Modelo e OpenAPI refletem apenas domínio aprovado; placeholders JWT/bearer, campos,
  status e limites pendentes não foram tratados como normativos.
- [ ] OpenAPI foi validado pela ferramenta/versionamento aprovado e o OpenSpec passou em
  `openspec validate saal-functional-readiness --strict --json`.
- [ ] Cada ID de interação tem rastreabilidade até capability, destino/endpoint ou N/A,
  persistência ou N/A, teste e status.
- [ ] Revisão documental encontrou links internos válidos e nenhuma afirmação de
  implementação/teste/deploy sem evidência.

Passar este gate conclui planejamento documental autorizado; não autoriza por si só I2 nem
implementação de funcionalidade.

## 3. Gate de PR e CI

- [ ] PR tem escopo, requisitos OpenSpec, riscos, evidências e plano de recuperação aplicável.
- [ ] Review independente foi obtido conforme as regras efetivamente configuradas no
  repositório; não presumir proteção de `main` ou checks obrigatórios.
- [ ] Todos os jobs obrigatórios aplicáveis passaram no commit exato do PR; logs/artifacts
  não contêm secrets nem dados pessoais.
- [ ] Frontend: instalação frozen, typecheck, testes, lint, format check, secret scan, audit
  e build passaram; registrar warnings anteriores separadamente e não introduzir novos.
- [ ] Backend, quando existir: Maven Wrapper/build reproduzível, JUnit/Spring tests,
  integração MySQL/Testcontainers, Flyway e scans aplicáveis passaram.
- [ ] OpenAPI validation, E2E ou security jobs só são declarados quando configurados e
  executados; não substituir resultado por intenção no plano.
- [ ] Não há defeito Critical/High aberto sem decisão formal de risco, responsável e
  mitigação; achados menores têm classificação e prazo.

## 4. Gate de incremento funcional

- [ ] Todos os critérios de aceite do incremento estão mapeados a testes/evidências, sem
  marcar itens de negócio ainda pendentes como satisfeitos.
- [ ] Testes positivos e negativos pertinentes cobrem validação, autorização, falha de rede,
  erro/empty/loading e persistência conforme a capability.
- [ ] A UI só comunica sucesso após confirmação real; entradas permanecem recuperáveis após
  falha; nenhum mock/fallback de produção mascara indisponibilidade.
- [ ] Testes de integração usam a dependência real pertinente (MySQL 8 para semântica de
  banco/migrations) e dados sintéticos.
- [ ] Segurança foi revisada segundo `docs/security/SECURITY_CHECKLIST.md`; findings têm
  severidade, evidência, status e responsável.
- [ ] Responsividade e acessibilidade aplicáveis têm evidência real do runner/browser e
  revisão manual; não afirmar teste de leitor de tela ou visual sem executá-lo.
- [ ] Interface, identidade visual e navegação existentes foram preservadas salvo alteração
  explicitamente requerida e aprovada.
- [ ] OpenSpec, contrato, modelo e matriz foram atualizados para refletir o comportamento
  entregue e os limites restantes.

## 5. Gate de release de demonstração

- [ ] Build de produção de frontend e imagem Docker do backend foram reproduzidos a partir do
  commit/tag que será liberado.
- [ ] Runtime aceita `PORT`, escuta em `0.0.0.0` e configura memória/conexões/timeouts conforme
  limites medidos; filesystem local não guarda estado durável.
- [ ] Banco usa conexão TLS verificada, segredo fora do repositório, privilégios mínimos e
  migrations serializadas/reprodutíveis; credencial runtime é distinta de migration.
- [ ] Auth, cookies, CSRF, CORS e eventual proxy foram testados em browser com a topologia
  configurada; chamadas diretas à API também permanecem autorizadas no servidor.
- [ ] Health/readiness e erros não revelam credenciais, stack trace, SQL ou PII; logs foram
  amostrados/redigidos.
- [ ] Backup/restore ou recuperação aplicável à demonstração foi testado e limites de plano
  documentados.
- [ ] Smoke tests confirmam rotas, API, DB, estados de falha e comportamento sem sessão após
  reinício conforme estratégia escolhida.
- [ ] Plano gratuito está rotulado como demonstração sujeita a suspensão, limites e
  indisponibilidade; não há promessa de SLA ou disponibilidade.

## 6. Gate para produção utilizada pela ONG

- [ ] Requisitos de negócio do escopo aprovado (catálogo + manifestação de interesse), conta
  administrativa única, publicação/visibilidade, PII, retenção, imagens, contato condicional e
  logs mínimos estão aprovados por responsáveis da ONG e, quando aplicável, privacidade/
  jurídico. Não há papéis diferenciados nem workflow de status de solicitação.
- [ ] Avaliação operacional confirmou provedor, região, domínio, quotas, disponibilidade,
  suporte, segurança, custos, monitoramento e processo de incidente; plano gratuito não é
  usado como garantia de produção.
- [ ] RPO/RTO, backup/restore, recuperação de banco, migrations, rotação de segredos e
  continuidade de sessão foram ensaiados e aprovados.
- [ ] Revisão AppSec apropriada foi concluída; Critical/High não resolvidos não seguem sem
  exceção formal de autoridade competente, risco aceito, mitigação, responsável e prazo.
- [ ] Acessibilidade/responsividade e jornadas completas foram verificadas no ambiente
  suportado; exceções têm risco e aprovação explícitos.
- [ ] Plano de rollout, rollback/forward-fix e comunicação está pronto; DDL MySQL não depende
  de rollback transacional.
- [ ] Responsável da ONG autorizou explicitamente a entrada em operação e tratamento de
  dados reais.

## 7. Regras de uso e exceções

- Não alterar configurações administrativas do GitHub como parte deste checklist sem
  autorização. A recomendação de proteger `main` e exigir checks deve ser encaminhada ao
  responsável e verificada na plataforma.
- Exceção a um gate exige item registrado com motivo, escopo, risco, mitigação, aprovador,
  data de expiração e ação de acompanhamento. Pendência de decisão da ONG não pode ser
  convertida em exceção técnica silenciosa.
- Um resultado não reproduzido deve constar como **não verificado**, e não como falha nem
  aprovação.

## 8. Referências

- [Plano de qualidade](QUALITY_PLAN.md)
- [Matriz de testes](TEST_MATRIX.md)
- [Tarefas OpenSpec I0–I11](../../openspec/changes/saal-functional-readiness/tasks.md)
- [Política de segurança](../security/SECURITY_POLICY.md)
- [Checklist AppSec](../security/SECURITY_CHECKLIST.md)
