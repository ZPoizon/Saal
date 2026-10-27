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

- Exibir nome, galeria, idade, porte, sexo, espécie, descrição, personalidade, informações
  médicas e status.
- Exibir ação de adoção apenas para status `available`.
- Para `treatment`, informar indisponibilidade temporária.
- Para identificador inexistente, informar que o animal não foi encontrado.
- Comportamento específico de adotados além da ausência da ação: `PENDENTE DE DECISÃO`.

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
- **Dado** animal disponível, **quando** o detalhe abrir, **então** a ação de interesse será
  exibida com o ID correto.
- **Dado** ID inexistente, **quando** a rota abrir, **então** será exibido estado não encontrado.

## 9. Dados necessários

Todos os campos de `Animal`, incluindo lista ordenada de imagens.

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
