# SITE-SET-001 — Configurações públicas do site

## Objetivo e estado

Permitir editar as informações públicas do site em um único painel administrativo. A
implementação atual é uma **demonstração local**, não um sistema de administração seguro:
React/Vite persiste os dados no `localStorage` do navegador atual. Não há backend, Supabase,
sincronização entre visitantes/dispositivos, autenticação real nem bloqueio no servidor.

## Escopo implementado

O painel `/admin` contém as abas Estatísticas, Página Inicial, Contato, Doações, Adoção,
Sobre a ONG, Campanhas e Avisos e Minha Conta. Os dados compartilhados aparecem nas páginas
públicas e persistem após recarregar o mesmo navegador.

- Estatísticas: valores históricos começam vazios e ocultos; contagens do catálogo são
  derivadas dos registros e somadas aos totais históricos correspondentes.
- Página inicial: textos simples, imagem HTTPS, destinos internos predefinidos e prévia.
- Contato: telefone, WhatsApp, e-mail, endereço, município, estado, redes sociais e horários
  centralizados; links gerados a partir desses dados.
- Doações: seção desligada por padrão, instruções e PIX configuráveis, QR Code por URL HTTPS
  e cópia da chave. Não há processamento de pagamentos.
- Adoção: explicações, requisitos, etapas, perguntas frequentes e confirmação configuráveis.
  Pausar interesses bloqueia o formulário na interface; não existe servidor para aplicar
  bloqueio autoritativo.
- Sobre a ONG: textos simples e URLs HTTPS para fotografias.
- Campanhas e avisos: limite de 20 registros, datas e visibilidade; campanhas futuras,
  ocultas ou expiradas não aparecem na página inicial.
- Minha Conta: identificação local e saída da demonstração. Não existe provedor de
  autenticação nem alteração de senha.

Todas as abas validam os dados antes de salvar, permitem descartar mudanças e alertam sobre
edições não salvas. Texto é renderizado como texto, sem HTML livre. Imagens são URLs HTTPS;
não há upload nem armazenamento de arquivos.

## Critérios e limites

- **Dado** configurações válidas, **quando** salvar, **então** elas aparecem nas superfícies
  públicas e permanecem no mesmo navegador após recarregar.
- **Dado** armazenamento inválido ou indisponível, **quando** carregar/salvar, **então** a
  interface informa a falha sem afirmar que salvou.
- **Dado** campanha oculta, futura ou expirada, **quando** renderizar a home, **então** ela
  não é exibida.
- **Dado** que o recebimento de interesses foi pausado, **quando** acessar formulário ou
  detalhe de animal, **então** a interface não permite enviar manifestação.
- **Não atendido nesta demonstração:** autorização/autenticação administrativas, persistência
  compartilhada, validação autoritativa ou bloqueio de interesses no backend. Não publicar
  como sistema seguro ou fonte pública sincronizada.

## Validações disponíveis

`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check` e `pnpm build`. Não há teste
de navegador/E2E configurado; os breakpoints devem ser conferidos manualmente quando houver
ambiente de browser.
