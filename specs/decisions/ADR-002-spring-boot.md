# ADR-002: Spring Boot para o backend

- **Status:** Aceito como arquitetura futura; não implementado
- **Contexto:** O protótipo precisa evoluir para persistência, autenticação e regras de
  servidor sem acoplar essas responsabilidades ao navegador.
- **Decisão:** Implementar futuramente uma API REST JSON em Java + Spring Boot, em serviço
  separado e orientada pelo OpenAPI.
- **Consequências:** O frontend consumirá `VITE_API_URL`; validação e autorização serão
  repetidas no servidor; será necessário pipeline próprio, testes e observabilidade.
- **Pendente de decisão:** versão do Java/Spring Boot, Maven/Gradle, sessão/JWT e hospedagem.
- **Alternativas não adotadas:** backend fictício no Vite, acesso direto ao banco e migração
  do frontend.
