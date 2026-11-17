# ONG-STAT-001 — Indicadores de impacto da ONG

## 1. Identificador e nome

`ONG-STAT-001` — Editar os indicadores de impacto exibidos na página inicial.

## 2. Objetivo

Permitir que a equipe atualize o número de animais resgatados, adoções realizadas, animais
em tratamento e famílias felizes apresentados publicamente.

## 3. Atores

Administrador SAAL; visitante da página inicial.

## 4. Pré-condições

- O administrador acessou o painel de demonstração.
- A página inicial mostra os indicadores públicos.

## 5. Regras de negócio

- Cada indicador aceita um número inteiro não negativo.
- Os valores atuais da home são somente valores iniciais de demonstração; sua exatidão e
  autorização para publicação precisam ser confirmadas pela ONG.
- No protótipo, os valores editados são guardados no `localStorage` do navegador atual.

## 6. Fluxo principal

1. Administrador abre a seção “Dados da ONG” no painel.
2. Edita um ou mais indicadores.
3. Salva os valores.
4. A página inicial reflete os novos valores e eles permanecem após recarregar no mesmo
   navegador.

## 7. Fluxos alternativos

- Valor vazio, negativo, fracionário ou fora do intervalo seguro: impedir salvar e informar o
  erro.
- Falha de leitura ou escrita no armazenamento local: informar a falha sem indicar sucesso.

## 8. Critérios de aceitação

- **Dado** indicadores válidos, **quando** o administrador salvar, **então** os quatro
  valores serão salvos localmente e a home exibirá os atualizados.
- **Dado** valor inválido, **quando** o administrador salvar, **então** os dados não serão
  atualizados e a interface explicará o erro.
- **Dado** que o navegador não consiga persistir os dados, **quando** o administrador salvar,
  **então** a interface não indicará sucesso.

## 9. Dados necessários

Contagem de animais resgatados, adoções realizadas, animais em tratamento e famílias felizes.

## 10. Contratos de API relacionados

Nenhum endpoint ativo. Persistência por API futura não está definida no contrato atual.

## 11. Validações

Cada valor deve ser um inteiro seguro maior ou igual a zero.

## 12. Requisitos de segurança

Os valores não contêm dados pessoais. O painel atual é um protótipo e não protege operações
administrativas; autenticação e autorização reais dependem de backend.

## 13. Cenários de teste

- valores padrão de demonstração;
- salvar e carregar valores atualizados;
- rejeitar dados persistidos inválidos;
- refletir os valores na página inicial.

## 14. Definição de pronto

Edição e exibição consistentes, persistência de backend futura quando implementada, revisão
dos valores pela ONG e validações aplicáveis aprovadas.

## 15. Estado atual

**Substituído/expandido.** Os indicadores agora fazem parte da aba Estatísticas em
[`site-settings.md`](site-settings.md). Valores históricos começam vazios e ocultos e são
persistidos apenas no navegador atual; não há servidor, sincronização entre dispositivos ou
validação dos números pela ONG.
