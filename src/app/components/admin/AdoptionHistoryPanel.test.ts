import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const PANEL_SOURCE = readFileSync(
  new URL("./AdoptionHistoryPanel.tsx", import.meta.url),
  "utf8",
)

describe("histórico de adoções sem limpeza manual", () => {
  it("não expõe botões, simulação ou variáveis de ambiente de limpeza", () => {
    expect(PANEL_SOURCE).not.toMatch(/VITE_ENABLE_PHOTO_CLEANUP/i)
    expect(PANEL_SOURCE).not.toMatch(/PHOTO_CLEANUP_ENABLED/i)
    expect(PANEL_SOURCE).not.toMatch(/Simular limpeza/i)
    expect(PANEL_SOURCE).not.toMatch(/limpeza definitiva/i)
    expect(PANEL_SOURCE).not.toMatch(/Limpeza de fotos/i)
  })

  it("não renderiza fotografias, miniaturas ou galeria no histórico", () => {
    expect(PANEL_SOURCE).not.toMatch(/<img/i)
    expect(PANEL_SOURCE).not.toMatch(/thumbnail/i)
    expect(PANEL_SOURCE).not.toMatch(/lightbox/i)
    expect(PANEL_SOURCE).not.toMatch(/storage_path/i)
  })

  it("mantém a consulta ao histórico disponível após o arquivamento", () => {
    expect(PANEL_SOURCE).toMatch(/Registro textual preservado/)
    expect(PANEL_SOURCE).toMatch(/Ver detalhes/)
  })
})
