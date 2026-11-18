import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const HOME_SOURCE = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8")

describe("banner principal da Home", () => {
  it("não expõe mais o botão administrativo no hero", () => {
    expect(HOME_SOURCE).not.toMatch(/to="\/admin"/)
    expect(HOME_SOURCE).not.toMatch(/\bLock\b/)
    expect(HOME_SOURCE).not.toMatch(/Área Administrativa/)
  })

  it("mantém o CTA principal centralizado", () => {
    expect(HOME_SOURCE).toMatch(/home\.primaryButtonDestination/)
    expect(HOME_SOURCE).toMatch(/home\.primaryButtonText/)
    expect(HOME_SOURCE).toMatch(
      /pointer-events-auto flex w-full justify-center/,
    )
  })
})
