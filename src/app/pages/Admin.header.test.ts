import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const ADMIN_SOURCE = readFileSync(
  new URL("./Admin.tsx", import.meta.url),
  "utf8",
)

function logoutButtonSource(): string {
  const marker = ADMIN_SOURCE.indexOf(
    'aria-label="Sair do painel administrativo"',
  )

  expect(marker).toBeGreaterThan(-1)

  const start = ADMIN_SOURCE.lastIndexOf("<button", marker)

  const end = ADMIN_SOURCE.indexOf("</button>", marker)

  return ADMIN_SOURCE.slice(start, end)
}

describe("cabeçalho administrativo — botão Sair", () => {
  it("mantém largura automática e não é esticado pelo container flex", () => {
    const button = logoutButtonSource()

    expect(button).toMatch(/\binline-flex\b/)
    expect(button).toMatch(/\bw-auto\b/)
    expect(button).toMatch(/\bself-end\b/)
    expect(button).toMatch(/\bshrink-0\b/)
    expect(button).not.toMatch(/\bw-full\b/)
    expect(button).not.toMatch(/\bflex-1\b/)
    expect(button).not.toMatch(/\bself-stretch\b/)
  })

  it("preserva a altura de toque e o ícone de saída", () => {
    const button = logoutButtonSource()

    expect(button).toMatch(/\bmin-h-11\b/)
    expect(button).toMatch(/<LogOut\b/)
  })

  it("preserva o logout existente", () => {
    const button = logoutButtonSource()

    expect(button).toMatch(/onClick=\{handleLogout\}/)
    expect(ADMIN_SOURCE).toMatch(/await logoutAdmin\(\)/)
    expect(ADMIN_SOURCE).toMatch(/setAuthStatus\("anonymous"\)/)
  })
})
