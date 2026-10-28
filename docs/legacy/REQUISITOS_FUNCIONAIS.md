# 📋 REQUISITOS FUNCIONAIS E NÃO FUNCIONAIS

> **Documento de requisitos legado:** caixas marcadas e status refletem um registro antigo,
> não comprovam implementação atual nem substituem as especificações SDD em `specs/`.
> Consulte o [índice histórico](README.md) antes de reutilizar este conteúdo.

## Projeto: SAAL - Santuário de Animais Anjos da Luz

---

## 1. REQUISITOS FUNCIONAIS

### RF-001: Sistema de Navegação
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** O sistema deve permitir navegação entre páginas sem recarregamento.

**Critérios de Aceitação:**
- [x] Navegação SPA (Single Page Application)
- [x] 7 páginas implementadas
- [x] Menu responsivo (desktop e mobile)
- [x] Breadcrumbs e navegação contextual
- [x] Botão voltar funcional

---

### RF-002: Listagem de Animais
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Exibir todos os animais cadastrados em formato de grid responsivo.

**Critérios de Aceitação:**
- [x] Grid de cards com fotos
- [x] Informações básicas visíveis (nome, idade, espécie)
- [x] Badge de status colorido
- [x] Link para página de detalhes
- [x] Responsivo (1, 2 ou 3 colunas)

---

### RF-003: Filtros de Busca
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Permitir filtrar animais por diferentes critérios.

**Critérios de Aceitação:**
- [x] Busca por nome (case insensitive)
- [x] Filtro por espécie (Cachorro/Gato/Todos)
- [x] Filtro por status (Disponível/Tratamento/Adotado/Todos)
- [x] Filtros funcionam em conjunto (AND logic)
- [x] Contador de resultados
- [x] Resposta em tempo real (sem delay)

---

### RF-004: Detalhes do Animal
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Exibir informações completas de um animal específico.

**Critérios de Aceitação:**
- [x] Galeria de fotos com navegação
- [x] Nome, idade, porte, sexo
- [x] Descrição detalhada
- [x] Traços de personalidade
- [x] Informações médicas
- [x] Status atual
- [x] Botão de ação condicional ao status
- [x] Opção de compartilhar

---

### RF-005: Formulário de Interesse
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Permitir que usuários manifestem interesse em adotar um animal.

**Critérios de Aceitação:**
- [x] Preview do animal selecionado
- [x] Campos: nome, email, telefone, mensagem
- [x] Validação de campos obrigatórios
- [x] Validação de formato de email
- [x] Feedback visual de envio
- [x] Modal de confirmação
- [x] Opções de navegação pós-envio

---

### RF-006: Formulário de Contato
**Prioridade:** Média  
**Status:** ✅ Implementado

**Descrição:** Permitir envio de mensagens gerais para a ONG.

**Critérios de Aceitação:**
- [x] Campos: nome, email, assunto, mensagem
- [x] Validação de campos obrigatórios
- [x] Informações de contato visíveis
- [x] Links externos funcionais
- [x] Feedback de envio

---

### RF-007: Autenticação Admin
**Prioridade:** Alta  
**Status:** ✅ Implementado (Demo)

**Descrição:** Sistema de login para área administrativa.

**Critérios de Aceitação:**
- [x] Tela de login
- [x] Validação de credenciais
- [x] Feedback de erro
- [x] Proteção de rotas admin
- [x] Sessão persistente durante navegação
- [ ] Logout funcional (implementado)
- [ ] JWT tokens (futuro)
- [ ] Recuperação de senha (futuro)

**Credenciais Demo:**
- Usuário: `admin`
- Senha: `saal2026`

---

### RF-008: Dashboard Administrativo
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Painel com visão geral dos dados.

**Critérios de Aceitação:**
- [x] Estatísticas em tempo real
- [x] Total de animais
- [x] Animais por status
- [x] Acesso rápido às funcionalidades
- [x] Botão de logout

---

### RF-009: Criar Animal (CRUD - Create)
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Cadastrar novo animal no sistema.

**Critérios de Aceitação:**
- [x] Modal com formulário completo
- [x] Upload de foto por URL
- [x] Upload de foto por arquivo local
- [x] Preview de imagem em tempo real
- [x] Campos obrigatórios validados
- [x] Geração automática de ID único
- [x] Salvamento instantâneo
- [x] Atualização da lista
- [x] Fechamento do modal

---

### RF-010: Listar Animais (CRUD - Read)
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Exibir todos os animais cadastrados no admin.

**Critérios de Aceitação:**
- [x] Tabela responsiva
- [x] Foto miniatura
- [x] Informações principais
- [x] Badge de status
- [x] Ações por linha
- [x] Scroll horizontal (mobile)

---

### RF-011: Editar Animal (CRUD - Update)
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Modificar dados de um animal existente.

**Critérios de Aceitação:**
- [x] Modal com dados pré-preenchidos
- [x] Todos os campos editáveis
- [x] Alterar foto
- [x] Preview atualizado
- [x] Validação de campos
- [x] Merge de dados ao salvar
- [x] Atualização imediata na lista

---

### RF-012: Deletar Animal (CRUD - Delete)
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Remover animal do sistema.

**Critérios de Aceitação:**
- [x] Botão de exclusão
- [x] Confirmação em dois cliques
- [x] Ícones visuais claros (✓/✗)
- [x] Possibilidade de cancelar
- [x] Remoção do banco
- [x] Atualização das estatísticas
- [x] Feedback visual

---

### RF-013: Upload de Imagens
**Prioridade:** Alta  
**Status:** ✅ Implementado (Frontend)

**Descrição:** Permitir upload de fotos dos animais.

**Critérios de Aceitação:**
- [x] Upload por URL externa
- [x] Upload por arquivo local
- [x] Conversão para Base64
- [x] Preview em tempo real
- [x] Validação de tipo de arquivo
- [x] Feedback de erro
- [ ] Upload para cloud storage (futuro)
- [ ] Redimensionamento automático (futuro)

---

### RF-014: Compartilhamento
**Prioridade:** Média  
**Status:** ✅ Implementado

**Descrição:** Permitir compartilhar animais em redes sociais.

**Critérios de Aceitação:**
- [x] Web Share API
- [x] Título personalizado
- [x] Descrição do animal
- [x] URL da página
- [x] Fallback para navegadores sem suporte

---

### RF-015: WhatsApp Direto
**Prioridade:** Média  
**Status:** ✅ Implementado

**Descrição:** Link direto para WhatsApp da ONG.

**Critérios de Aceitação:**
- [x] Botão flutuante fixo
- [x] Mensagem pré-definida
- [x] Número correto: (15) 99692-7636
- [x] Abre em nova aba
- [x] Tooltip informativo
- [x] Visível em todas as páginas

---

### RF-016: Gestão de Interessados
**Prioridade:** Média  
**Status:** ⏳ Parcial (Interface pronta, backend pendente)

**Descrição:** Visualizar e gerenciar pessoas interessadas em adoção.

**Critérios de Aceitação:**
- [x] Seção no painel admin
- [ ] Listar interessados
- [ ] Filtrar por animal
- [ ] Marcar como contatado
- [ ] Exportar dados
- [ ] Enviar resposta

---

### RF-017: Responsividade
**Prioridade:** Alta  
**Status:** ✅ Implementado

**Descrição:** Site funcional em todos os dispositivos.

**Critérios de Aceitação:**
- [x] Mobile (< 768px)
- [x] Tablet (768px - 1024px)
- [x] Desktop (> 1024px)
- [x] Menu adaptável
- [x] Grid responsivo
- [x] Imagens otimizadas
- [x] Touch-friendly buttons

---

### RF-018: Animações
**Prioridade:** Baixa  
**Status:** ✅ Implementado

**Descrição:** Animações sutis para melhor UX.

**Critérios de Aceitação:**
- [x] Hero banner animado
- [x] Cards com hover
- [x] ScrollReveal
- [x] Modais com fade in
- [x] Transições suaves
- [x] Loading states

---

## 2. REQUISITOS NÃO FUNCIONAIS

### RNF-001: Performance
**Prioridade:** Alta  
**Status:** ✅ Atendido

**Descrição:** O sistema deve carregar rapidamente.

**Critérios:**
- [x] Tempo de carregamento inicial < 3s
- [x] Transições de página < 100ms
- [x] Build otimizado (Vite)
- [x] Assets comprimidos
- [x] Lazy loading de rotas

**Métricas:**
- Arquivos: 64 .tsx
- Assets: ~2MB
- Bundle size: Otimizado

---

### RNF-002: Usabilidade
**Prioridade:** Alta  
**Status:** ✅ Atendido

**Descrição:** Interface intuitiva e fácil de usar.

**Critérios:**
- [x] Navegação clara
- [x] Feedback visual constante
- [x] Mensagens de erro claras
- [x] Confirmações de ação
- [x] Tooltips informativos
- [x] Design consistente

---

### RNF-003: Acessibilidade
**Prioridade:** Média  
**Status:** ✅ Parcial

**Descrição:** Acessível para pessoas com deficiência.

**Critérios:**
- [x] Alt texts em imagens
- [x] Labels em inputs
- [x] Contraste adequado
- [x] Navegação por teclado
- [x] Semântica HTML
- [ ] ARIA labels completos
- [ ] Screen reader testado
- [ ] WCAG 2.1 AA (meta futura)

---

### RNF-004: Compatibilidade
**Prioridade:** Alta  
**Status:** ✅ Atendido

**Descrição:** Funcionar em navegadores modernos.

**Browsers Suportados:**
- ✅ Chrome 100+
- ✅ Firefox 100+
- ✅ Safari 15+
- ✅ Edge 100+
- ❌ IE 11 (não suportado)

---

### RNF-005: Segurança
**Prioridade:** Alta  
**Status:** ⏳ Parcial

**Descrição:** Proteção de dados e sistema.

**Implementado:**
- [x] Validação de inputs (client-side)
- [x] TypeScript (type safety)
- [x] HTTPS obrigatório

**Pendente (Produção):**
- [ ] Autenticação JWT
- [ ] Hash de senhas
- [ ] Rate limiting
- [ ] CORS configurado
- [ ] CSP headers
- [ ] XSS protection
- [ ] SQL injection prevention

---

### RNF-006: Manutenibilidade
**Prioridade:** Média  
**Status:** ✅ Atendido

**Descrição:** Código fácil de manter e evoluir.

**Critérios:**
- [x] Código organizado
- [x] Componentes reutilizáveis
- [x] TypeScript para type safety
- [x] Nomenclatura clara
- [x] Separação de responsabilidades
- [x] Documentação completa

---

### RNF-007: Escalabilidade
**Prioridade:** Média  
**Status:** ✅ Preparado

**Descrição:** Suportar crescimento de dados e usuários.

**Considerações:**
- [x] Arquitetura componentizada
- [x] State management local (escalável para Redux/Zustand)
- [x] Preparado para API REST
- [x] Paginação preparada
- [ ] Cache strategy (futuro)
- [ ] CDN para assets (futuro)

---

### RNF-008: Disponibilidade
**Prioridade:** Alta  
**Status:** ⏳ Depende de infraestrutura

**Descrição:** Sistema disponível 24/7.

**Meta:** 99.9% uptime

**Dependências:**
- [ ] Hosting confiável
- [ ] Monitoramento
- [ ] Backups automáticos
- [ ] Disaster recovery plan

---

### RNF-009: Internacionalização (i18n)
**Prioridade:** Baixa  
**Status:** ❌ Não implementado

**Descrição:** Suporte para múltiplos idiomas.

**Planejamento Futuro:**
- [ ] Português (PT-BR) - idioma atual
- [ ] Inglês (EN)
- [ ] Espanhol (ES)
- [ ] Biblioteca i18next

---

### RNF-010: SEO
**Prioridade:** Média  
**Status:** ⏳ Parcial

**Descrição:** Otimização para motores de busca.

**Implementado:**
- [x] Headings semânticos
- [x] Alt texts
- [x] URLs amigáveis

**Pendente:**
- [ ] Meta tags dinâmicas
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Schema.org markup
- [ ] Open Graph tags
- [ ] SSR ou SSG (considerar Next.js)

---

## 3. REQUISITOS DE SISTEMA

### Hardware Recomendado (Servidor)

**Desenvolvimento/Small Scale:**
- CPU: 1 vCore
- RAM: 1GB
- Storage: 10GB SSD
- Bandwidth: 1TB/mês

**Produção/Medium Scale:**
- CPU: 2 vCores
- RAM: 4GB
- Storage: 50GB SSD
- Bandwidth: 5TB/mês

---

### Software Necessário

**Desenvolvimento:**
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (ou npm/yarn)
- Git
- Editor (VS Code recomendado)

**Produção:**
- Node.js (para build)
- Servidor web (Nginx/Apache)
- SSL Certificate (Let's Encrypt)
- Domain/DNS

---

## 4. REQUISITOS DE DADOS

### Dados Persistentes

**Animais:**
- ID único
- Informações básicas (8 campos)
- Fotos (URLs ou Base64)
- Timestamps (criado, atualizado)

**Interessados:**
- Nome, email, telefone
- Animal de interesse
- Mensagem
- Data/hora

**Mensagens de Contato:**
- Nome, email, assunto
- Mensagem
- Data/hora

**Administradores:**
- Username, password (hash)
- Permissões
- Último login

---

### Volume de Dados Estimado

**Ano 1:**
- Animais: ~50-100
- Interessados: ~200-500
- Mensagens: ~100-300
- Storage: ~500MB - 2GB

**Ano 5:**
- Animais: ~300-500
- Interessados: ~2000-5000
- Mensagens: ~1000-3000
- Storage: ~5GB - 10GB

---

## 5. PRIORIZAÇÃO (MoSCoW)

### Must Have (Obrigatório) ✅
- [x] Listagem de animais
- [x] Detalhes do animal
- [x] Filtros de busca
- [x] Formulário de interesse
- [x] CRUD completo (Admin)
- [x] Autenticação básica
- [x] Responsividade
- [x] Upload de imagens

### Should Have (Importante) ✅
- [x] Formulário de contato
- [x] WhatsApp flutuante
- [x] Compartilhamento
- [x] Animações
- [x] Dashboard admin

### Could Have (Desejável) ⏳
- [ ] Gestão de interessados completa
- [ ] Notificações por email
- [ ] Exportar dados
- [ ] Múltiplas fotos por animal
- [ ] Vídeos

### Won't Have (Não terá agora) ❌
- [ ] App mobile nativo
- [ ] Chat em tempo real
- [ ] Sistema de doações
- [ ] Blog integrado
- [ ] Multi-idioma

---

## 6. DEPENDÊNCIAS EXTERNAS

### APIs Necessárias (Futuro)

- **Backend:** Supabase, Firebase ou REST API própria
- **Storage:** Cloudinary, AWS S3 ou Supabase Storage
- **Email:** SendGrid, Mailgun ou Resend
- **Analytics:** Google Analytics 4
- **Monitoring:** Sentry (errors), Uptime Robot

---

## 7. RESTRIÇÕES

### Técnicas
- Deve usar React 18+
- Deve ser TypeScript
- Deve usar Tailwind CSS
- Build tool: Vite

### Negócio
- Orçamento limitado (ONG sem fins lucrativos)
- Equipe pequena
- Prazo de desenvolvimento já cumprido

### Legais
- LGPD compliance (dados pessoais)
- Termos de uso
- Política de privacidade

---

## 8. CRITÉRIOS DE ACEITE GLOBAL

### Definição de Pronto (DoD)

Um requisito está completo quando:
- [x] Código implementado
- [x] Funcionalidade testada manualmente
- [x] Responsivo em 3 breakpoints
- [x] Sem erros TypeScript
- [x] Documentado
- [ ] Testes automatizados (futuro)
- [ ] Code review (se equipe)

---

## 9. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Falta de backend | Alta | Alto | Dados mockados funcionais |
| Upload de imagens grande | Média | Médio | Validação de tamanho, compressão |
| Spam em formulários | Alta | Médio | Captcha futuro, rate limiting |
| Baixa adoção | Média | Alto | SEO, marketing, redes sociais |
| Falta de manutenção | Média | Alto | Documentação completa, código limpo |

---

## 10. MÉTRICAS DE SUCESSO

### KPIs Técnicos
- Uptime > 99%
- Tempo de carregamento < 3s
- Zero erros críticos
- Mobile usage > 60%

### KPIs de Negócio
- Interessados em adoção > 10/mês
- Taxa de conversão visita → interesse > 5%
- Compartilhamentos > 50/mês
- Satisfação usuários > 4/5

---

**Documento elaborado em:** Maio de 2026  
**Última revisão:** Maio de 2026  
**Versão:** 1.0  
**Status:** ✅ Aprovado
