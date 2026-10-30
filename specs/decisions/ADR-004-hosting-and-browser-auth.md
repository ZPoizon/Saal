# ADR-004: Destinos de hospedagem e topologia de acesso browser/API

- **Status:** Proposta de hospedagem; autenticação inicial aprovada separadamente em ADR-006;
  nenhum deploy autorizado ou realizado.
- **Data:** 2026-10-28.
- **Evidência:** decisão expressa do responsável técnico para manter Java/Spring Boot/MySQL
  e preferir Cloudflare Pages, Render Free e Aiven MySQL Free inicialmente. A preferência de
  fornecedor não equivale à aprovação para dados reais ou produção. Identidade nominal do
  responsável não foi fornecida na evidência.

## Contexto

O frontend é React + TypeScript + Vite. O destino preferencial é Cloudflare Pages; o serviço
Java será empacotado em Docker e o MySQL 8 será acessado exclusivamente pelo backend. As
origens padrão de Pages e Render são distintas. Cookies de autenticação cross-site podem ser
bloqueados ou restringidos por navegadores; CORS não autentica clientes e não substitui
CSRF, autorização ou controles contra chamadas diretas à API.

As ofertas gratuitas são alvos de prototipagem condicionados. Não há evidência de projeto,
conta, região, domínio, preço final, disponibilidade, SLA ou operação real configurada.

## Preferências e proposta

1. **Frontend:** Cloudflare Pages para servir a SPA estática. Uma configuração pública do
   frontend pode apontar para uma URL/base de API; não colocar credenciais, tokens ou chaves
   privadas em `VITE_*`.
2. **Backend:** Render Web Service com imagem Docker como alvo preferencial de validação.
   O app deve escutar em `0.0.0.0` e aceitar a porta do ambiente (`PORT`, cujo default Render
   documentado é `10000`). Nenhum estado durável pode depender do filesystem local.
3. **Banco:** Aiven MySQL Free para prototipagem sujeita a quota, disponibilidade, TLS,
   conectividade de saída e inatividade. A conexão deve validar TLS/certificado e usar
   credenciais protegidas e privilégio mínimo.
4. **Rota de API a avaliar:** Cloudflare Pages Functions em caminho same-origin, como
   `/api/*`, atuando somente como proxy de transporte para Render. A Function não deve
   conter regras de domínio, persistir dados nem substituir a API Spring Boot. Avaliar
   autenticação do canal proxy (segredo de serviço fora do bundle), allowlist de caminhos e
   métodos, remoção de headers fornecidos pelo cliente, tratamento correto de cookies e
   headers, limites de corpo/tempo, logs redigidos e custo/quotas.
5. **Autenticação:** a decisão aprovada para a implementação inicial é sessão server-side
   same-site via proxy, CSRF e cookie restrito (ADR-006). A decisão não aprova hosting ou
   domínio; a topologia cross-site direta e cookies de terceiros não são suportados nesta
   etapa. Não presumir que `SameSite=None` resolva compatibilidade ou privacidade dos browsers.
6. **Compartilhamento de sessão:** Spring Session JDBC com MySQL pode preservar sessões entre
   reinícios do processo, desde que schema, compatibilidade, expiração, invalidação, conexões
   e disponibilidade do banco sejam planejados. Isso não evita logout por expiração,
   revogação, perda do banco ou alteração de configuração.

## Controles e requisitos de validação

- Toda operação admin valida autenticação, permissão e acesso ao recurso no backend.
- Em cookies enviados automaticamente, manter CSRF habilitado com token apropriado e
  validação de origem conforme o desenho; `SameSite` é defesa adicional, não substituto.
- CORS, se usado, permite somente origens exatas e necessárias; jamais combinar credenciais
  com origem curinga. Chamadas não-browser e acesso direto ao host Render também precisam
  ser seguros sem depender de CORS.
- O segredo entre proxy e API, se esse controle for aprovado, fica em secret stores/variáveis
  secretas dos serviços, nunca no Vite, HTML, logs ou repositório; deve ser rotacionável.
- O aplicativo externo deve ser portável: configuração de ambiente, storage adapters e
  persistência por interfaces, sem regras de negócio dependentes de APIs Render/Aiven.
- Docker deve respeitar cgroups/limites de memória do plano; configurar limites da JVM com
  base em medição e memória disponível, sem fixar valores antes de conhecer runtime e quota.
- Executar migrations de forma serializada, versionada e reproduzível; definir como executar
  com credencial separada e rede disponível em cada ambiente. Não rodar DDL destrutivo nem
  depender de rollback transacional MySQL.
- Upload de imagens permanece bloqueado até aprovação ONG-06 e seleção de storage externo
  compatível com limites, acesso, custo, retenção e validação de conteúdo.

## Limitações verificadas nas ofertas gratuitas

- [Render Free](https://render.com/docs/free): a documentação atual recomenda não usar
  instâncias free em produção. Web Services entram em spin-down após 15 minutos sem tráfego,
  podem levar aproximadamente um minuto para despertar e têm filesystem efêmero; os dados
  locais são perdidos em restart, redeploy ou spin-down. Há 750 horas mensais por workspace,
  compartilhadas; excesso de tráfego/uso pode suspender serviços. Portanto, arquivos locais,
  SQLite, sessões em memória e uploads não são persistência aceitável.
- [Render Web Services](https://render.com/docs/web-services): container deve escutar em
  `0.0.0.0`; a plataforma recomenda `PORT` e documenta default `10000`. TLS de entrada
  termina no load balancer Render; tráfego serviço–Aiven é separado e requer TLS de cliente.
- [Aiven Free MySQL](https://aiven.io/free-mysql-database): oferta anunciada com 1 CPU, 1 GB
  RAM, 1 GB storage e backups diários, single-node/no HA; Aiven informa que serviços free
  podem ser desligados por inatividade e que o plano não é indicado para produção de alto
  tráfego. Confirmar os termos, armazenamento, restore, região e conectividade exibidos no
  provisionamento; página comercial e documentação geral não bastam como SLA.
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) e
  [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/):
  páginas estáticas têm quotas de build/arquivos; invocações de Functions consomem quota de
  Workers. O plano Workers Free atualmente limita a 100.000 requests/dia, 10 ms CPU por
  invocação e 128 MB de memória; um proxy de I/O precisa ser medido e permanecer sem lógica
  de negócio.
- Free tiers podem alterar limites e disponibilidade. Ausência de cobrança não representa
  suporte, SLA, alta disponibilidade, backups adequados ao risco ou conformidade.

## Pendências operacionais antes do deploy/produção

- Confirmar disponibilidade de Spring Boot 4.1.2 e compatibilidade de build/runtime no
  momento de iniciar I2; a matriz oficial de Java/Maven não comprova recursos/adequação do
  plano Render para produção.
- Medir footprint de JVM/containers e adequar `PORT`, heap, pool de conexões, timeouts e
  health/readiness probes ao plano escolhido.
- Confirmar TLS de saída, cadeia de certificados, regiões, IPs de egress, allowlists e limites
  de conexão Aiven; não abrir o MySQL ao mundo como contorno para ausência de IP estável.
- Escolher domínio/origin e proxy de produção e provar fluxo de cookies, CSRF, CORS estrito,
  logout, reinício e comportamento operacional nos browsers suportados. A implementação atual
  usa sessão em memória de instância única; Spring Session JDBC não está habilitado.
- Aprovar secret manager/canal de provisionamento, rotação e acessos administrativos.
- Definir política e operação de migrations, backup/restore, monitoramento e resposta a
  incidentes; validar custos e limites atuais com as contas reais.
- Obter decisões ONG sobre identidade nominal/lifecycle do administrador (sem papéis), coleta
  e retenção de dados, publicação, elegibilidade, imagens e conteúdo antes de transformar
  requisitos de negócio em contrato.

## Consequências

Cloudflare Pages + Render + Aiven é uma **preferência de avaliação e prototipagem**, não uma
garantia de hosting gratuito sustentável nem arquitetura aprovada para produção. Um proxy
same-origin em Pages é uma alternativa recomendada para investigação, mas ainda requer
decisão de topologia e revisão AppSec. Se limites gratuitos forem incompatíveis com
disponibilidade, segurança, persistência ou volume, preservar Java/Spring Boot/MySQL e
selecionar planos pagos ou outros provedores compatíveis; não trocar o backend sem nova
autorização.
