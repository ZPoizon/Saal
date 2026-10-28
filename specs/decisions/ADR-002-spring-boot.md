# ADR-002: Spring Boot para o backend

- **Status:** Aceito como arquitetura futura; não implementado
- **Contexto:** O protótipo precisa evoluir para persistência, autenticação e regras de
  servidor sem acoplar essas responsabilidades ao navegador.
- **Decisão:** Implementar futuramente uma API REST JSON em Java + Spring Boot, em serviço
  separado e orientada pelo OpenAPI. Por decisão expressa do responsável técnico registrada
  em 2026-10-28, a baseline alvo é Java 21 LTS, Spring Boot 4.1.2, Maven Wrapper,
  Spring Security, Spring Data JPA, Bean Validation e empacotamento Docker. A equipe também
  escolheu JUnit 5, Spring Boot Test e Testcontainers com MySQL 8 para testes futuros. Erros
  estruturados serão baseados em RFC 9457. Isso registra escolhas tecnológicas, não inicia
  nem implementa o backend.
- **Compatibilidade verificada:** a documentação oficial de requisitos do Spring Boot 4.1.2
  declara Java 17–27, Spring Framework 7.0.10 ou superior, Maven 3.6.3+ e Gradle 8.14+
  (linha 8.x) ou 9.x. Java 21 e Maven Wrapper são compatíveis com essa matriz. Revalidar
  versões de plugins, suporte upstream e runtime de deploy antes de I2.
- **Consequências:** o frontend continuará separado e usará configuração pública de URL/base
  da API (preferencialmente caminho relativo `/api` se a rota por proxy same-origin for
  aprovada); variáveis `VITE_*` nunca conterão segredos. Validação e autorização serão
  autoritativas no servidor; serão necessários pipeline backend, testes, observabilidade,
  configuração de porta e limites de recursos por ambiente.
- **Ainda pendente:** revalidar suporte/disponibilidade do Spring Boot 4.1.2 e plugins no
  início de I2; versão exata do Maven Wrapper; topologia/origens, mecanismo final de
  autenticação e CSRF; limites de deploy, secret store e configuração de produção. Sessão
  server-side revogável é preferência condicional, não decisão de protocolo ou topologia.
- **Alternativas não adotadas:** backend fictício no Vite, acesso direto ao banco e migração
  do frontend.

## Registro de decisão técnica — 2026-10-28

- **Aprovado pelo responsável técnico:** Java 21 LTS, Spring Boot 4.1.2 condicionado à
  confirmação de compatibilidade/disponibilidade antes de I2, Maven Wrapper, Spring
  Security, Spring Data JPA, Bean Validation, API REST, Docker, JUnit 5, Spring Boot Test,
  Testcontainers com MySQL 8 e RFC 9457 para erros estruturados.
- **Evidência:** decisão expressa do responsável técnico registrada na solicitação de
  atualização documental de 2026-10-28; identidade nominal não fornecida nesta evidência.
- **Limite:** a documentação oficial confirma a matriz de compatibilidade da versão 4.1.2,
  mas os limites/recursos da oferta Render Free e a topologia final de autenticação ainda
  precisam de validação. Esta decisão não autoriza deploy nem implementação.
- **Sessão:** sessão server-side revogável é a preferência técnica, não uma decisão fechada
  de protocolo/topologia. Spring Session JDBC é uma opção para compartilhar sessões pela
  base externa e tolerar reinícios da instância, condicionada ao ADR de hosting/auth e à
  validação de limites e disponibilidade do MySQL.

Referências:

- [Spring Boot — System Requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring Boot — Spring Session](https://docs.spring.io/spring-boot/reference/web/spring-session.html)
- [Spring Security — CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html)
