# ADLC-001 — Ciclo de vida da adoção e retenção das fotos

## 1. Identificador e nome

`ADLC-001` — Confirmação, histórico, reversão e limpeza de fotos de animais adotados.

## 2. Objetivo

Registrar a adoção de forma transacional e auditável, permitir a reversão com justificativa e
remover as fotos do Storage somente após 30 dias contados da data real da adoção. O histórico
deve preservar os dados mesmo após a exclusão do animal ou da manifestação de interesse.

## 3. Atores

- Administrador SAAL autenticado (único papel existente).
- Público visitante (somente leitura do catálogo e envio de manifestação).
- Rotina automática agendada no servidor (`Supabase Cron` → Edge Function com `service_role`),
  sem navegador, sessão administrativa ou clique.

## 4. Pré-condições

- Migrações `003_add_treatment_status_and_lifecycle.sql`,
  `004_adoptions_history_and_cleanup.sql` e `005_adoption_animal_snapshots.sql` aplicadas no
  projeto Supabase.
- Administrador existente em `admin_users` e sessão válida.
- Bucket `animal-photos` existente, com leitura pública do catálogo e permissão de exclusão
  para o serviço.

## 5. Regras de negócio

### Estados do animal

- `available`: aparece no catálogo e aceita manifestações.
- `treatment`: aparece no catálogo, mas não aceita manifestações.
- `adopted`: só é gravado pela confirmação de adoção; nunca por edição direta do formulário.

### Confirmação de adoção

- Somente administrador; executada pela RPC `confirm_adoption` em uma transação.
- A origem é `site` (exige manifestação vinculada ao mesmo animal) ou `external`.
- Nome do adotante é obrigatório. Para adoção externa, ao menos um contato (telefone ou
  e-mail) é obrigatório no cliente.
- A data é a data real informada, sem horário (`YYYY-MM-DD`, persistida como `00:00 UTC` em
  `adoptions.adoption_date` e `animals.adopted_at`). Não pode estar no futuro.
- Um animal só pode ter uma adoção ativa. O índice único parcial e a verificação na RPC
  impedem duplicidade mesmo com chamadas concorrentes.
- A operação grava snapshots do nome, espécie, sexo, porte, idade, descrição,
  personalidade e informações de saúde do animal, além dos dados do adotante; o histórico não
  depende de o animal ou a manifestação continuarem existindo (`ON DELETE SET NULL`).
- Sair de `adopted` exige reversão com motivo; a data de adoção não pode ser alterada por
  edição comum.

### Reversão

- Somente administrador; RPC `reverse_adoption`.
- Exige motivo com ao menos 5 caracteres e destino `available` ou `treatment`.
- Marca `reversed_at`, `reversed_by` e `reversal_reason`; o registro permanece no histórico.
- Cancela a limpeza pendente (`cleanup_status = 'cancelled'`) e limpa o erro de limpeza. Se a
  limpeza já estava concluída, o resultado é preservado.

### Regularização de adoção legada

- Animal `adopted` com `adopted_at` nulo (legado) não inicia contagem retroativa, permanece
  visível no catálogo e nunca é alvo automático de limpeza.
- O administrador pode informar a data real pela RPC `regularize_legacy_adoption`; isso cria o
  registro de histórico e grava `adopted_at`, iniciando a janela a partir da data real.
- Nenhuma data é inventada automaticamente.

### Janela de 30 dias e visibilidade

- A janela termina em `adopted_at + 30 dias` (UTC). Em 29 dias ainda não expirou; em 30 dias
  completos já expirou.
- O catálogo público deixa de listar o animal assim que a janela vence, mesmo que a limpeza de
  arquivos ainda não tenha rodado. A policy de RLS e o filtro do cliente aplicam a mesma regra.
- Adotados sem data conhecida permanecem visíveis até regularização ou reversão.

### Limpeza das fotos

- A remoção usa exclusivamente a API oficial do Supabase Storage
  (`storage.from(bucket).remove(paths)`), nunca `DELETE` direto em `storage.objects`.
- Bucket fixo `animal-photos`; caminho válido no formato `animals/<uuid>.<ext>`.
- A propriedade é calculada pela união de `animals.images` (URLs do projeto) e
  `animal_photos.storage_path`. Caminho usado por mais de um animal, URL externa, URL
  ambígua ou caminho inválido não é apagado: a adoção é marcada como `failed` para revisão.
- A referência em `animals.images` só é removida após confirmação da exclusão no Storage.
  Em falha parcial, apenas as URLs efetivamente removidas saem da lista; a próxima execução
  tenta novamente. O `archived_at` é gravado apenas na conclusão.
- A Edge Function confirma a ausência física com `storage.list` quando `storage.remove` não
  devolve o objeto removido. O banco não aceita `completed` apenas porque o cliente afirmou
  que apagou: `record_adoption_cleanup` é exclusivo do `service_role` e revalida adoção ativa,
  animal `adopted`, `adopted_at`, janela de 30 dias, propriedade das URLs e ausência de fotos
  pendentes em `animals.images`.
- O resultado é registrado por adoção (`pending`, `scheduled`, `completed`, `failed`,
  `cancelled`), com erro e timestamps de tentativa/conclusão. A RPC de registro aceita apenas
  `completed` ou `failed` como estados finais.
- A execução é 100% no servidor: `Supabase Cron` (pg_cron + pg_net) chama diariamente a Edge
  Function `cleanup-adopted-photos`, que usa `service_role`. Não há botão, simulação, timer ou
  variável pública no painel; o navegador não recebe credenciais nem poderes de exclusão.
- A Edge Function exige o segredo de servidor `ADOPTION_CLEANUP_SECRET` (cabeçalho
  `x-cleanup-secret` ou `Authorization: Bearer`). Sem segredo configurado, responde `503` e não
  executa nada.
- A rotina é idempotente e tolerante a falhas: só considera candidatos com 30 dias completos,
  pula `completed`/`cancelled`, exige animal `adopted` e permite nova tentativa segura.

## 6. Fluxo principal (confirmação)

1. Administrador localiza o animal ou a manifestação.
2. Escolhe confirmar adoção; o modal abre com origem, contato e data.
3. O cliente valida os campos e chama `confirm_adoption`.
4. A RPC bloqueia o animal, verifica permissão, estado, vínculo e duplicidade, insere o
   histórico e atualiza o animal.
5. A interface recarrega animais e histórico e informa o sucesso.

## 7. Fluxos alternativos

- Falha de rede/RLS: mensagem de erro, sem alteração otimista.
- Animal já adotado: 409 e instrução para atualizar o histórico.
- Reversão sem motivo válido: bloqueada no cliente e no banco.
- Animal excluído: o histórico permanece; a reversão é recusada porque não há animal.
- Limpeza com foto compartilhada: marcada como falha, sem exclusão.
- Limpeza com falha parcial: URLs removidas são retiradas, restante fica pendente de nova
  tentativa na próxima execução.
- Função agendada indisponível ou sem segredo: erro registrado, nenhuma foto apagada; a próxima
  execução diária tenta novamente.

## 8. Critérios de aceitação

- **Dado** animal `available`/`treatment` e administrador autenticado, **quando** confirmar a
  adoção com data real, **então** o histórico é criado e o animal fica `adopted` com
  `adopted_at` igual à data informada.
- **Dado** adoção já ativa, **quando** tentar confirmar outra, **então** a operação é recusada
  sem criar registro.
- **Dado** adoção com 29 dias, **quando** consultar o catálogo, **então** o animal continua
  visível e a limpeza não o seleciona.
- **Dado** adoção com 30 ou 31 dias, **quando** consultar o catálogo, **então** o animal não
  aparece; a limpeza o seleciona.
- **Dado** adoção legada sem data, **quando** qualquer rotina rodar, **então** nenhuma foto é
  apagada e o animal continua visível.
- **Dado** foto compartilhada ou URL inválida, **quando** a limpeza real rodar, **então** nada
  é apagado e a adoção fica `failed`.
- **Dado** falha do Storage em parte dos arquivos, **quando** registrar o resultado, **então**
  somente as URLs removidas deixam o catálogo e a adoção fica `failed`.
- **Dado** limpeza com fotos ainda referenciadas em `animals.images`, **quando** alguém tentar
  registrar `completed`, **então** o banco recusa e mantém o estado anterior.
- **Dado** adoção revertida, animal não adotado, data desconhecida ou janela de 30 dias não
  vencida, **quando** o serviço tentar concluir a limpeza, **então** o banco recusa.
- **Dado** chamada com URLs que não pertencem ao animal, **quando** registrar a limpeza,
  **então** o banco recusa sem alterar o catálogo.
- **Dado** reversão com motivo, **quando** confirmada, **então** o animal volta ao destino e o
  histórico mantém o registro revertido; a limpeza pendente é cancelada.
- **Dado** usuário sem `admin_users`, **quando** consultar adoções, **então** o acesso é
  negado; não há auto-promoção.
- **Dado** animal com adoção ativa, **quando** tentar excluir o cadastro, **então** o banco
  recusa até que a adoção seja revertida.
- **Dado** o agendamento diário configurado, **quando** a data passar de 30 dias, **então** a
  limpeza executa sem login ou navegador e registra o resultado por adoção.
- **Dado** o painel administrativo, **quando** consultado, **então** não há botões, simulação ou
  variáveis de limpeza manual, e o histórico é somente textual.

## 9. Dados necessários

`adoptions`: identificador, referência opcional ao animal e à manifestação, snapshots de nome,
espécie, sexo, porte, idade, descrição, personalidade e informações de saúde do animal, origem,
dados do adotante, data real, observações, autoria/timestamps da confirmação e da reversão,
estado e resultado da limpeza.

`animals`: `status`, `adopted_at`, `archived_at` e `images`.

O histórico exibe apenas texto. Fotografias, miniaturas, galeria, lightbox e identificadores do
Storage não fazem parte da interface nem dos dados retornados por ela.

Retenção de PII do adotante (nome, telefone, e-mail): `PENDENTE DE DECISÃO` (LGPD/ONG-05).
A exclusão das fotos não remove o histórico pessoal. Nenhum dado pessoal é apagado sem
aprovação.

## 10. Contratos

RPCs Supabase (não fazem parte do OpenAPI do backend Spring):

| RPC | Parâmetros | Retorno |
|---|---|---|
| `confirm_adoption` | `p_animal_id`, `p_interest_id`, `p_origin`, `p_adopter_name`, `p_adopter_phone`, `p_adopter_email`, `p_adoption_date`, `p_notes` | linha de `adoptions` |
| `reverse_adoption` | `p_adoption_id`, `p_reason`, `p_target_status` | linha de `adoptions` |
| `regularize_legacy_adoption` | `p_animal_id`, `p_adoption_date`, `p_adopter_name`, `p_notes` | linha de `adoptions` |
| `list_adoption_cleanup_candidates` | `p_now` | adoções vencidas com URLs atuais |
| `record_adoption_cleanup` | `p_adoption_id`, `p_status`, `p_removed_urls`, `p_error` | linha de `adoptions` |

Todas são `security definer`, com `search_path = ''` e verificação explícita de administrador.
`list_adoption_cleanup_candidates` aceita administrador ou `service_role`. `record_adoption_cleanup`
é exclusiva do `service_role`, aceita apenas `completed`/`failed` e revalida o estado do banco
antes de gravar qualquer resultado.

## 11. Validações

- Nome obrigatório e limitado a 120 caracteres; contatos com até 160; observações com até 2000.
- E-mail com formato básico; data de calendário válida e não futura.
- Origem `site` exige manifestação do mesmo animal; origem externa exige ao menos um contato.
- Reversão exige motivo com ao menos 5 caracteres e destino permitido.
- No banco: CHECKs de origem, status, consistência da reversão e conclusão da limpeza; índice
  único de adoção ativa; gatilho que bloqueia mudança direta de status/data.

## 12. Requisitos de segurança

- `adoptions` tem RLS habilitada e apenas administradores podem ler; não há policy de escrita
  para o cliente. Escritas passam pelas RPCs.
- `is_admin()` consulta `admin_users`; não há policy que permita auto-promoção. O login
  administrativo consulta o próprio registro via `is_admin()` (`security definer`), portanto
  continua funcionando sem leitura pública de `admin_users`.
- Leitura pública de animais é limitada aos visíveis; `interests` continua sem leitura pública
  e `site_settings` mantém leitura pública com escrita administrativa via `is_admin()`.
- Excluir um animal com adoção ativa é bloqueado por gatilho; o histórico é preservado com
  `ON DELETE SET NULL` quando a exclusão é permitida após a reversão.
- Limpeza valida bucket e caminho, nunca apaga fotos de outro animal e usa apenas a API de
  Storage. A ausência física do objeto é confirmada por `storage.list` quando necessário.
- `record_adoption_cleanup` é exclusiva do `service_role`; valida adoção ativa, animal `adopted`,
  `adopted_at`, janela de 30 dias, subconjunto de `animals.images` e ausência de fotos
  pendentes antes de aceitar `completed`. Parâmetros do cliente não são confiáveis.
- A Edge Function exige o segredo de servidor `ADOPTION_CLEANUP_SECRET`; não aceita
  credenciais do navegador e não expõe poder de exclusão ao cliente.
- Logs não devem incluir telefone/e-mail do adotante nem nomes de animais; o histórico é a
  fonte autorizada.

## 13. Cenários de teste automatizados

- `src/app/data/adoption-lifecycle.test.ts`: 29/30/31 dias, visibilidade, legado, transições.
- `src/app/data/adoption-validation.test.ts`: data, contatos, origem e reversão.
- `src/app/data/adoption-history.test.ts`: estatísticas e filtros.
- `src/app/data/adoption-history-details.test.ts`: histórico textual, snapshots (incluindo
  personalidade), fallback e ausência de URLs/fotos.
- `src/app/data/supabase-migrations.test.ts`: invariantes das migrações 003/004/005, conclusão
  indevida da limpeza, reversão, índice único, constraints NOT VALID, guarda de exclusão,
  RLS de `admin_users`/`animals`, snapshots de personalidade e confirmação física no Storage.
- `supabase/functions/_shared/adoption-photo-cleanup.test.ts`: janela 10/29/30/31 dias,
  execução sem sessão administrativa, fotos compartilhadas, arquivos de outro animal, falha
  parcial com retentativa, idempotência, reversão, legado sem data, falha de registro e
  confirmação da ausência física via `storage.list`.
- `src/app/services/animals-api.test.ts`: bloqueio de adoção direta e visibilidade do legado.

Os testes usam dependências injetadas e arquivos fictícios; nenhuma foto real é apagada.
Não há teste de integração com o Supabase real, teste de navegador ou teste do agendador
pg_cron.

## 14. Definição de pronto

Migração revisada e aplicada com aprovação; RPCs e RLS verificadas no projeto real; limpeza
testada em ambiente de homologação com arquivos descartáveis; agendamento criado e observado no
Supabase; typecheck, lint, testes, formatação e build verdes; política de retenção de PII
aprovada.

## 15. Estado atual e pendências

**Implementado no worktree, não aplicado remotamente.** O código cobre estados, confirmação,
reversão, regularização, histórico textual, RLS, snapshots e a rotina automática de limpeza no
servidor. As migrações `003`, `004` e `005` foram revisadas para execução segura em esquema já
existente, mas ainda precisam de aprovação e aplicação no Supabase.

Limitações conhecidas:

- O agendamento ainda não está ativo: depende de aplicar
  `supabase/scheduling/adoption-photo-cleanup-cron.sql`, habilitar `pg_cron`/`pg_net`, criar os
  segredos no Vault, publicar a Edge Function e definir `ADOPTION_CLEANUP_SECRET`. Só a Edge
  Function implementada não torna o sistema 100% automático.
- Animal legado `adopted` sem data não pode ser revertido pela interface; é preciso regularizar
  a data real e então reverter. A correção manual no SQL Editor exige
  `set_config('saal.adoption_flow', 'on', false)` e deve ser registrada.
- As policies do bucket `animal-photos` não estão versionadas; é preciso confirmar leitura
  pública e exclusão pelo serviço.
- A retenção dos dados pessoais do adotante continua pendente de decisão da ONG.
- Nenhuma fotografia real foi excluída; a ativação depende de aprovação explícita.
