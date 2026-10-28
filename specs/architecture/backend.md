# Arquitetura do backend planejado

## Estado

**Não implementado.** Este documento define direção, não afirma a existência de servidor.

## Tecnologia aprovada

- Java 21 LTS e Spring Boot 4.1.2, condicionado à compatibilidade/disponibilidade confirmadas
  no início do I2.
- Maven Wrapper.
- API REST com JSON.
- Spring Security, Spring Data JPA e Bean Validation.
- JUnit 5, Spring Boot Test e Testcontainers com MySQL 8 para testes futuros.
- Docker; respostas de erro estruturadas baseadas em RFC 9457.
- Contrato inicial: `../contracts/openapi.yaml`.

Escolhas documentais não significam implementação. O registro de evidência e condicionantes
está em [`../decisions/I1-approval-register.md`](../decisions/I1-approval-register.md).

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

Flyway foi escolhido para migrations versionadas. Nenhuma migration/schema de negócio foi
aprovada ou criada nesta etapa.

## Pendências

- `PENDENTE DE DECISÃO`: desenho de sessão/autenticação e topologia de origem/proxy/CSRF;
  sessão server-side revogável é a preferência, não decisão final.
- `PENDENTE DE DECISÃO`: perfis administrativos.
- `PENDENTE DE DECISÃO`: provedor de e-mail e storage.
- `PENDENTE DE DECISÃO`: hosting de produção, deploy e observabilidade.
