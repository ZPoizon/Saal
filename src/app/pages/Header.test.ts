import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const HEADER_SOURCE = readFileSync(
  new URL("../components/Header.tsx", import.meta.url),
  "utf8",
)

describe("acesso administrativo no cabeçalho", () => {
  it("oferece acesso ao painel no desktop e no menu mobile", () => {
    const adminLinks = HEADER_SOURCE.match(/to="\/admin"/g) ?? []

    expect(adminLinks).toHaveLength(2)
    expect(HEADER_SOURCE).toMatch(/<Lock\b/)
    expect(HEADER_SOURCE).toMatch(/\bAdmin\b/)
    expect(HEADER_SOURCE).toMatch(/Área administrativa/)
  })

  it("fecha o menu mobile ao navegar para a administração", () => {
    const mobileMenuStart = HEADER_SOURCE.indexOf("{/* Mobile Menu */}")

    const mobileMenu = HEADER_SOURCE.slice(mobileMenuStart)

    expect(mobileMenu).toMatch(/to="\/admin"/)
    expect(mobileMenu).toMatch(/onClick=\{\(\) => setMenuOpen\(false\)\}/)
  })

  it("mantém a navegação pública e o CTA principal", () => {
    expect(HEADER_SOURCE).toMatch(/>\s*Início\s*</)
    expect(HEADER_SOURCE).toMatch(/>\s*Animais\s*</)
    expect(HEADER_SOURCE).toMatch(/>\s*Contato\s*</)
    expect(HEADER_SOURCE).toMatch(/>\s*Quero Adotar\s*</)
  })
})
