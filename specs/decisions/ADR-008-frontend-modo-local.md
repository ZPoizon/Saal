# ADR-008: Frontend em modo protótipo local (sem API)

- **Status:** Aceito (temporário); reversível ao religar a integração.
- **Data:** 2026-11-17.
- **Evidência:** instrução explícita do responsável pelo projeto: o site precisa ficar
  funcional primeiro; as complicações de API/backend estão atrasando a evolução da interface.

## Contexto

O frontend já estava conectado aos serviços da API (`/api/v1/...`): catálogo, detalhe,
manifestação de interesse, área administrativa (sessão, CSRF, animais, interessados e fotos).
Nas execuções atuais o ambiente não dispõe de backend em execução (sem Docker, MySQL ou
Java), e a API publicada responde 404 para as rotas públicas consumidas. O resultado é um
site travado em estados de carregamento/erro ("Carregando animais…", painel administrativo
bloqueado em "Verificando sessão administrativa…"), o que impede validar e evoluir a
interface.

## Decisões

1. **Modo local no navegador:** os serviços de frontend (`animals-api`, `interests-api`,
   `admin-auth`, `photo-storage`) passam a ler/escrever no `localStorage`
   (`saal.local.animals.v1` e `saal.local.interests.v1`), semeando os dados de exemplo
   históricos do projeto no primeiro acesso. As assinaturas públicas dos serviços são
   preservadas; religar a API exige reverter apenas esta camada.
2. **Área administrativa com login local simples:** por instrução do responsável, o painel
   exige credencial fixa `admin` / senha definida no código (`saal2026`). A sessão vive no
   `sessionStorage` da aba (encerra ao fechar). Isto **não é autenticação real**: a credencial
   está visível no código fonte e não há validação de servidor — viola a regra de não
   armazenar credenciais no código, aceita aqui como exceção temporária do protótipo com
   rotulagem explícita; a credencial não deve ser reutilizada em produção. As regras de
   sessão server-side, CSRF e ADR-006 continuam válidas para o modo com API e voltam a valer
   integralmente na religação.
3. **Fotos como `data:` URL:** a normalização (EXIF, limite de 1600 px, JPEG) é mantida;
   o resultado é embutido no cadastro local em vez de enviado a `POST /api/v1/admin/photos`.
   O espaço do `localStorage` (~5 MB) é a limitação conhecida; excesso é reportado como erro.
4. **Rotulagem obrigatória:** o painel administrativo exibe "protótipo local" e explica que
   os dados ficam somente naquele navegador. Proibições vigentes: não descrever esse estado
   como persistência real nem substituir dados reais por fictícios silenciosamente.
5. **Estado nas specs:** as features que dependiam de API passam ao estado **Protótipo**
   (interface funcional com dados locais), conforme `specs/README.md`. O contrato
   `specs/contracts/openapi.yaml` permanece normativo para a religação.
6. **Exclusão de animais habilitada no protótipo:** por decisão do responsável (2026-11-17),
   o painel oferece botão de exclusão com confirmação (`window.confirm`) e o serviço local
   expõe `deleteAnimal`, que responde 404 para id inexistente. Isso antecipa parte de
   ONG-03 apenas no modo local; no modo com API, exclusão/arquivamento permanece
   `PENDENTE DE DECISÃO` (a API atual retorna 405 em `DELETE`). Manifestações de interesse
   anteriores mantêm o nome do animal removido, pois ele é copiado no registro.

## Consequências

- O site fica navegável sem Docker/Java/MySQL e a área administrativa abre por `/admin`
  (link "Área Administrativa" no hero e no rodapé).
- Dados pessoais de manifestações de interesse ficam restritos ao navegador do visitante;
  a ONG não os recebe enquanto o modo local estiver ativo (OAUTH-04/ONG-04 continuam sem
  fluxo real).
- Testes dos serviços foram reescritos para o comportamento local; os testes de contrato
  HTTP anteriores foram removidos com a integração (não descrevem mais o código atual).
