# Retenção de dados pessoais — adoções e manifestações

**Estado:** política proposta; prazos e base legal `PENDENTE DE DECISÃO` (ONG-05).
**Última revisão:** 2026-11-18.
**Escopo:** dados de adotantes e interessados coletados pelo site SAAL e armazenados no
Supabase (`public.adoptions` e `public.interests`).

## 1. Dados tratados

| Origem | Campos | Finalidade atual |
|---|---|---|
| Manifestação de interesse | nome completo, WhatsApp, cidade, e-mail, animal, data | contato manual da ONG |
| Confirmação de adoção | nome do adotante, telefone, e-mail, data real, observações, autoria | histórico da adoção e comprovação |
| Reversão | motivo, autor, data | auditoria da alteração de estado |

Não há coleta de documento, endereço, dados financeiros ou dados sensíveis nesta
funcionalidade.

## 2. Regra vigente

- Nenhum dado pessoal é apagado automaticamente pelo sistema.
- A limpeza automática implementada em `ADR-009` remove apenas arquivos de fotos de animais
  após 30 dias da adoção; ela **não** apaga registros de `adoptions` nem de `interests`.
- A remoção de dados pessoais exige decisão da ONG e aprovação explícita antes de qualquer
  execução em produção.
- O acesso é restrito a administradores autenticados; o público não lê `adoptions` nem
  `interests`.
- Logs de aplicação não devem conter telefone, e-mail ou nome do adotante.

## 3. Pendências de decisão

1. Base legal e aviso de privacidade para cada finalidade.
2. Prazo de retenção de manifestações não convertidas em adoção.
3. Prazo de retenção do histórico de adoções confirmadas e revertidas.
4. Procedimento de atendimento ao titular (consulta, correção, exclusão).
5. Responsável pelo tratamento, canal de contato e registro de operações.
6. Destino dos dados após o prazo: exclusão, anonimização ou arquivamento restrito.

Enquanto os itens acima não forem aprovados, a plataforma mantém os registros e aplica apenas
minimização de acesso e finalidade.

## 4. Controles técnicos existentes

- RLS em `adoptions` com leitura apenas para `admin_users`.
- `interests` sem leitura pública após a migração `004`.
- `admin_users` sem auto-promoção pelo cliente.
- Nenhuma exclusão automática de PII.
- Exclusão de fotos separada, automática e restrita ao servidor, com registro por adoção.

## 5. Procedimento de exclusão aprovada (futuro)

1. Registrar a solicitação e a base legal da exclusão.
2. Identificar os registros por titular, sem ampliar a coleta.
3. Fazer backup/exportação restrita quando exigido pela política aprovada.
4. Executar a exclusão/anonimização com autorização de administrador.
5. Registrar data, responsável, escopo e resultado, sem copiar o dado removido.
6. Comunicar o titular conforme a política aprovada.

Este procedimento não deve ser executado enquanto os prazos e a base legal estiverem
`PENDENTE DE DECISÃO`.
