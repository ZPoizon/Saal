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

- Exibir galeria de 1–3 fotos e estado. Nome, idade, porte, sexo, espécie, descrição,
  personalidade e informação médica continuam `PENDENTE DE DECISÃO` (ONG-10).
- Exibir ação de manifestação de interesse apenas para estado `AVAILABLE`.
- Para `ADOPTED`, identificar o animal como adotado e não oferecer a ação. A visibilidade
  pública de adotados depende de ONG-02.
- O estado `TREATMENT` do protótipo não foi aprovado e não deve ser implementado.
- Para identificador inexistente, informar que o animal não foi encontrado.

## 6. Fluxo principal

1. Visitante abre `/animais/{id}`.
2. Sistema encontra e apresenta o animal.
3. Visitante alterna imagens ou compartilha a página.
4. Se disponível, visitante segue para `/interesse/{id}`.

## 7. Fluxos alternativos

- ID inexistente: mostrar mensagem e retorno ao catálogo.
- Navegador sem Web Share API: o botão atual não executa fallback.
- Falha futura da API: apresentação `PENDENTE DE IMPLEMENTAÇÃO`.

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

Planejado: `GET /animals/{animalId}`. Não implementado.

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

**Protótipo.** Funciona com dados mockados e Web Share API; sem API e sem fallback de
compartilhamento.
