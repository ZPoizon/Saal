# ADR-007: Fotografias no MySQL e topologia de produção Render/Aiven/Vercel

- **Status:** Aceito para implementação limitada; provisionamento externo pendente.
- **Data:** 2026-11-16.
- **Evidência:** instrução explícita do mantenedor para finalizar a parte funcional sem Docker,
  Java ou MySQL local, mantendo um único site Vercel e um único ambiente de desenvolvimento.
  A política definitiva de imagem continua pendente na ONG (ONG-06).

## Contexto

O formulário administrativo já permitia escolher, pré-visualizar e reordenar 1–3 imagens, mas
o backend persistia apenas URLs textuais. Era necessário armazenamento definitivo para fotos
enviadas de celular, login administrativo funcional e persistência real de animais e
interessados em produção, sem adicionar um serviço externo de storage nem exigir Docker na
máquina de desenvolvimento.

A topologia disponível é: frontend na Vercel, API em container no Render e MySQL gerenciado no
Aiven. O Render encerra TLS, aplica um `PORT` dinâmico e mantém cookie de sessão apenas com
proxy same-origin. O Aiven exige TLS e separação entre credencial de runtime e de migration.

## Decisões

1. **Binário no MySQL:** a tabela `stored_photo` (migration V3) guarda `content_type`,
   `byte_size`, `data` (`LONGBLOB`) e `created_at`. Não há CDN ou bucket adicional; a foto é
   imutável e servida por `GET /api/v1/photos/{id}` com cache público de um ano e
   `X-Content-Type-Options: nosniff`.
2. **Upload administrativo:** `POST /api/v1/admin/photos` recebe um campo `photos` por arquivo,
   exige `ROLE_ADMIN` e CSRF, aceita 1–3 arquivos e responde
   `{"urls":["/api/v1/photos/123"]}` na ordem enviada. O contrato multipart existente no
   frontend é preservado.
3. **Validação por bytes:** o servidor identifica JPEG, PNG e WebP pelos magic bytes, ignora o
   `Content-Type` declarado e limita cada arquivo a 5 MB e a requisição a 16 MB. SVG e demais
   formatos são recusados com 415.
4. **Normalização no cliente:** antes do envio, o navegador aplica orientação EXIF, limita o
   maior lado a 1600 px, converte para JPEG (qualidade 0,82) e descarta metadados. Cada foto é
   enviada em uma requisição separada para reduzir o corpo e evitar limites de proxy. A prévia
   local continua usando o arquivo original.
5. **Limpeza de órfãos:** uploads sem referência em `animal_photo` por mais de 24 horas são
   apagados durante novos uploads. Não há scheduler; a operação pressupõe uma instância.
6. **Credencial administrativa:** `SAAL_ADMIN_PASSWORD_HASH` tem precedência; como conveniência
   de provisionamento, `SAAL_ADMIN_PASSWORD` (12–128 caracteres) é convertida em BCrypt 12 no
   startup. Nenhuma senha é gravada no repositório ou no banco; ambos vêm de secret do Render.
7. **Produção:** `render.yaml` descreve a API em `backend/` com health check
   `/actuator/health`, uma instância e segredos `sync: false`. `vercel.json` reescreve `/api`
   para o Render, preservando same-origin. O Vite usa o mesmo destino por padrão no
   desenvolvimento, sem exigir `.env`, e remove `Secure` do cookie apenas no tráfego do proxy
   local.

## Consequências e limites

- O menor plano do Aiven tem armazenamento limitado; a normalização no cliente é necessária
  para manter o uso viável. Crescimento exige plano maior ou storage externo, decisão futura.
- Sessão, rate limit e limpeza de órfãos vivem em uma instância. Múltiplas réplicas exigem
  Spring Session/JDBC e coordenação da limpeza, fora deste incremento.
- O binário no banco aumenta o tráfego do Render e o tempo de resposta da primeira leitura;
  cache público mitiga leituras repetidas. Não há antivírus, moderação, CDN ou transformação
  de imagem no servidor.
- A política da ONG sobre formatos adicionais, limites definitivos, EXIF, retenção e exclusão
  de imagens continua pendente (ONG-06). Esta decisão é técnica e reversível.
- A disponibilidade real depende de criar Aiven, Render e Vercel; nenhum desses painéis é
  presumido configurado por este ADR.

## Alternativas rejeitadas nesta etapa

- Serviço externo de object storage (S3/R2/Supabase): exigiria mais conta, credencial e
  configuração sem necessidade imediata.
- Base64 ou `blob:` no navegador: não é persistência e não sobrevive a recarga/dispositivo.
- Filesystem do container: efêmero no Render e incompatível com uma instância recriada.
