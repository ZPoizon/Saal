# Arquitetura do backend planejado

## Estado

**Não implementado.** Este documento define direção, não afirma a existência de servidor.

## Tecnologia aprovada

- Java + Spring Boot.
- API REST com JSON.
- MySQL 8.
- Contrato inicial: `../contracts/openapi.yaml`.

## Responsabilidades

- autenticar administradores e autorizar operações;
- validar dados independentemente do frontend;
- persistir animais e solicitações;
- aplicar transições de status;
- proteger dados pessoais, registrar auditoria e controlar concorrência;
- oferecer erros previsíveis conforme OpenAPI.

## Organização sugerida

Separar domínio, aplicação e infraestrutura de forma pragmática:

```text
br.org.saal
  animal/
  adoption/
  auth/
  shared/
```

Controllers expõem HTTP, services coordenam regras, repositories persistem. Entidades JPA
não devem ser retornadas diretamente como DTOs públicos.

## Segurança mínima

- hashes de senha com algoritmo adequado; nunca senha reversível;
- sessão/token em HTTPS, expiração, logout e menor privilégio;
- validação server-side, CORS restritivo e rate limiting em endpoints públicos;
- logs sem senhas, tokens ou conteúdo pessoal desnecessário;
- migrations versionadas e segredos via ambiente/secret manager.

## Pendências

- `PENDENTE DE DECISÃO`: Maven ou Gradle.
- `PENDENTE DE DECISÃO`: JWT ou sessão segura por cookie.
- `PENDENTE DE DECISÃO`: perfis administrativos.
- `PENDENTE DE DECISÃO`: provedor de e-mail e storage.
- `PENDENTE DE DECISÃO`: estratégia de deploy e observabilidade.
