# Documentação do SAAL

Este diretório reúne documentação de arquitetura, engenharia, segurança, qualidade,
diagnóstico e registros históricos. As especificações normativas de produto e arquitetura
ficam em `specs/`; tarefas e changes em andamento ficam em `openspec/`.

| Diretório | Conteúdo |
|---|---|
| [`architecture/`](architecture/ARCHITECTURE.md) | Arquitetura atual do frontend e direção futura aprovada. |
| `development/` | Padrões e verificações de desenvolvimento. |
| `security/` | Política e checklist de segurança. |
| `quality/` | Plano de qualidade, matriz de testes e gates de release. |
| `diagnostics/` | Auditorias estáticas, inventários e rastreabilidade; cada relatório declara seu escopo e data. |
| [`deployment/`](deployment/VERCEL_RENDER_AIVEN.md) | Roteiro de demonstração Vercel + Render + Aiven; não comprova deploy ativo nem aprovação de produção. |
| [`legacy/`](legacy/README.md) | Documentos históricos preservados, não normativos e não comprobatórios de funcionamento atual. |

O frontend permanece um protótipo com dados mockados/estado em memória. Consulte as
especificações atuais antes de usar documentação histórica para tomar decisões ou afirmar
comportamento implementado.
