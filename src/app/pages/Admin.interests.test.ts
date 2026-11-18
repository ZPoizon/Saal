import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const ADMIN_SOURCE = readFileSync(
  new URL("./Admin.tsx", import.meta.url),
  "utf8",
)

function interestsSectionSource(): string {
  const start = ADMIN_SOURCE.indexOf("Solicitações de Adoção")

  const end = ADMIN_SOURCE.indexOf('{activeTab === "history"', start)

  expect(start).toBeGreaterThan(-1)
  expect(end).toBeGreaterThan(start)

  return ADMIN_SOURCE.slice(start, end)
}

describe("cards de interessados", () => {
  const section = interestsSectionSource()

  it("mantém contato e confirmação em uma única área de ações", () => {
    expect(section).toMatch(/contact-trigger-/)
    expect(section).toMatch(/aria-expanded=/)
    expect(section).toMatch(/aria-controls=/)
    expect(section).toMatch(/role="region"/)
    expect(section.match(/border-t border-\[#2E7D6B\]\/10/g)).toHaveLength(1)
    expect(section).toMatch(
      /flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center/,
    )
    expect(section).toMatch(/sm:ml-auto sm:w-auto/)
    expect(section).not.toMatch(/sm:min-w-48/)
    expect(section).toMatch(/Confirmar Adoção/)
  })

  it("expande os canais logo abaixo das ações em grade responsiva", () => {
    expect(section).toMatch(/mt-3 rounded-xl border/)
    expect(section).toMatch(/grid grid-cols-1 gap-2 sm:grid-cols-3/)
    expect(section).toMatch(/sm:mt-4/)
  })

  it("empilha botões e evita texto cortado em telas pequenas", () => {
    expect(section).toMatch(/min-h-11 w-full/)
    expect(section).toMatch(/break-words/)
    expect(section).not.toMatch(/truncate/)
  })

  it("usa singular e plural corretos no contador", () => {
    expect(section).toMatch(
      /interests\.length === 1 \? "registro" : "registros"/,
    )
  })

  it("mantém os três canais de contato e a explicação de envio manual", () => {
    expect(section).toMatch(/links\.whatsapp/)
    expect(section).toMatch(/links\.phone/)
    expect(section).toMatch(/links\.email/)
    expect(section).toMatch(/target="_blank"/)
    expect(section).toMatch(/rel="noopener noreferrer"/)
    expect(section).toMatch(/nenhuma mensagem é enviada automaticamente/)
  })

  it("preserva a confirmação vinculada ao interessado", () => {
    expect(section).toMatch(/setConfirmingAnimal/)
    expect(section).toMatch(/initialInterestId: interest\.id/)
    expect(section).toMatch(/canConfirmAdoption\(animal\)/)
  })
})
