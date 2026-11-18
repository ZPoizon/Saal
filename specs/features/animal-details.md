# DET-001 — Detalhes do animal

## 1. Identificador e nome

`DET-001` — Consultar detalhes de um animal.

## 2. Objetivo

Apresentar informações suficientes para o visitante conhecer o animal e, se disponível,
iniciar uma solicitação de adoção.

## 3. Atores

Visitante.

## 4. Pré-condições

O identificador existe no conjunto de dados acessível.

## 5. Regras de negócio

- Exibir galeria de 1–3 fotos e estado. Informação médica não deve ser retornada nem exibida
  publicamente até definição dos campos autorizados (ONG-05/ONG-10).
- Exibir ação de manifestação de interesse apenas para estado `available`.
- Para `adopted`, identificar o animal como adotado e não oferecer a ação. A visibilidade
  pública depende da data real: após 30 dias o detalhe deixa de ser público; legados sem data
  permanecem visíveis (ADR-009).
- O estado `treatment` foi aprovado para o catálogo e exibe o animal, mas não oferece ação de
  manifestação (`ADLC-001`/ADR-009).
- Para identificador inexistente ou adoção expirada, informar que o animal não foi encontrado.

## 6. Fluxo principal

1. Visitante abre `/animais/{id}`.
2. Sistema encontra e apresenta o animal.
3. Visitante alterna imagens ou compartilha a página.
4. Se disponível, visitante segue para `/interesse/{id}`.

## 7. Fluxos alternativos

- ID inexistente: mostrar mensagem e retorno ao catálogo.
- Navegador sem Web Share API: o botão atual não executa fallback.
- Falha da API: exibir erro recuperável e permitir nova tentativa.

## 8. Critérios de aceitação

- **Dado** um animal existente, **quando** o detalhe abrir, **então** seus dados serão exibidos.
- **Dado** múltiplas imagens, **quando** uma miniatura for acionada, **então** ela será a
  imagem principal.
- **Dado** animal `AVAILABLE`, **quando** o detalhe abrir, **então** a ação de interesse será
  exibida com o ID correto.
- **Dado** animal `ADOPTED` acessível, **quando** o detalhe abrir, **então** ele será
  identificado como adotado e a ação de interesse não será exibida.
- **Dado** ID inexistente, **quando** a rota abrir, **então** será exibido estado não encontrado.

## 9. Dados necessários

Decisão aprovada: estado (`AVAILABLE`/`ADOPTED`) e lista ordenada de 1–3 imagens. Demais
campos públicos continuam `PENDENTE DE DECISÃO` (ONG-10).

## 10. Contratos de API relacionados

Implementado: `GET /animals/{animalId}`. A resposta pública omite informação médica.

## 11. Validações

ID obrigatório; índice da galeria dentro da lista; URLs de imagem validadas no backend futuro.

## 12. Requisitos de segurança

Dados públicos devem excluir informações internas/sensíveis. Conteúdo administrativo deve
ser sanitizado antes de renderização.

## 13. Cenários de teste

- detalhe completo;
- troca de imagem;
- CTA por status;
- compartilhamento suportado e não suportado;
- ID desconhecido;
- retorno para catálogo.

## 14. Definição de pronto

Critérios cobertos, estados remotos tratados quando aplicável, acessibilidade da galeria
validada, typecheck/build válidos e interface preservada.

## 15. Estado atual

**Parcial no worktree.** O detalhe usa a API, indica status e oferece interesse somente para
animais disponíveis. A informação médica não é pública; Web Share API não possui fallback.
