import { describe, expect, it } from "vitest"

import {
  adoptionDateToIso,
  hasFieldErrors,
  isValidCalendarDate,
  todayDateInputValue,
  validateAdoptionDate,
  validateConfirmAdoptionInput,
  validateRegularizeLegacyAdoptionInput,
  validateReversalInput,
} from "./adoption-validation"
import type { ConfirmAdoptionInput } from "./animals"

const NOW = new Date("2026-05-10T12:00:00.000Z")

function validInput(
  overrides: Partial<ConfirmAdoptionInput> = {},
): ConfirmAdoptionInput {
  return {
    animalId: "animal-1",
    interestId: null,
    origin: "external",
    adopterName: "Maria Silva",
    adopterPhone: "15 99999-0000",
    adopterEmail: "maria@example.org",
    adoptionDate: "2026-05-01",
    notes: "",
    ...overrides,
  }
}

describe("datas de adoção", () => {
  it("aceita uma data de calendário válida", () => {
    expect(isValidCalendarDate("2026-02-28")).toBe(true)
    expect(isValidCalendarDate("2024-02-29")).toBe(true)
  })

  it("recusa datas impossíveis e formatos diferentes", () => {
    expect(isValidCalendarDate("2026-02-30")).toBe(false)
    expect(isValidCalendarDate("2025-02-29")).toBe(false)
    expect(isValidCalendarDate("01/02/2026")).toBe(false)
  })

  it("recusa datas futuras e aceita hoje", () => {
    expect(validateAdoptionDate("2026-05-11", NOW)).toBe(
      "A data da adoção não pode estar no futuro.",
    )
    expect(validateAdoptionDate("2026-05-10", NOW)).toBeUndefined()
  })

  it("exige uma data", () => {
    expect(validateAdoptionDate("", NOW)).toBe("Informe a data real da adoção.")
  })

  it("converte a data escolhida para ISO UTC", () => {
    expect(adoptionDateToIso("2026-05-01")).toBe("2026-05-01T00:00:00.000Z")
  })

  it("usa a data local de hoje no formato do input", () => {
    expect(todayDateInputValue(NOW)).toBe("2026-05-10")
  })
})

describe("validação da confirmação de adoção", () => {
  it("aceita adoção externa com nome e ao menos um contato", () => {
    expect(
      hasFieldErrors(validateConfirmAdoptionInput(validInput(), NOW)),
    ).toBe(false)
  })

  it("exige nome do adotante", () => {
    const errors = validateConfirmAdoptionInput(
      validInput({ adopterName: "   " }),
      NOW,
    )

    expect(errors.adopterName).toBe("Informe o nome do adotante.")
  })

  it("recusa e-mail inválido", () => {
    const errors = validateConfirmAdoptionInput(
      validInput({ adopterEmail: "invalido" }),
      NOW,
    )

    expect(errors.adopterEmail).toBe("Informe um e-mail válido.")
  })

  it("exige ao menos um contato na adoção externa", () => {
    const errors = validateConfirmAdoptionInput(
      validInput({ adopterPhone: "", adopterEmail: "" }),
      NOW,
    )

    expect(errors.adopterPhone).toBe(
      "Informe ao menos um contato (telefone ou e-mail).",
    )
  })

  it("exige manifestação vinculada na adoção de origem no site", () => {
    const errors = validateConfirmAdoptionInput(
      validInput({ origin: "site", interestId: null }),
      NOW,
    )

    expect(errors.adopterName).toContain("precisa estar vinculada")
  })

  it("recusa data futura", () => {
    const errors = validateConfirmAdoptionInput(
      validInput({ adoptionDate: "2026-05-11" }),
      NOW,
    )

    expect(errors.adoptionDate).toBe(
      "A data da adoção não pode estar no futuro.",
    )
  })

  it("limita o tamanho das observações", () => {
    const errors = validateConfirmAdoptionInput(
      validInput({ notes: "x".repeat(2001) }),
      NOW,
    )

    expect(errors.notes).toContain("2000")
  })
})

describe("validação da regularização legada", () => {
  it("aceita nome e data sem telefone ou e-mail", () => {
    expect(
      hasFieldErrors(
        validateRegularizeLegacyAdoptionInput(
          {
            animalId: "animal-1",
            adopterName: "Maria Silva",
            adoptionDate: "2026-05-01",
            notes: "",
          },
          NOW,
        ),
      ),
    ).toBe(false)
  })

  it("exige nome e data real", () => {
    const errors = validateRegularizeLegacyAdoptionInput(
      {
        animalId: "animal-1",
        adopterName: "   ",
        adoptionDate: "",
      },
      NOW,
    )

    expect(errors.adopterName).toBe("Informe o nome do adotante.")
    expect(errors.adoptionDate).toBe("Informe a data real da adoção.")
  })

  it("recusa data futura", () => {
    const errors = validateRegularizeLegacyAdoptionInput(
      {
        animalId: "animal-1",
        adopterName: "Maria Silva",
        adoptionDate: "2026-05-11",
      },
      NOW,
    )

    expect(errors.adoptionDate).toBe(
      "A data da adoção não pode estar no futuro.",
    )
  })
})

describe("validação da reversão", () => {
  it("aceita motivo com ao menos 5 caracteres", () => {
    expect(
      hasFieldErrors(
        validateReversalInput("Devolução pelo adotante", "available"),
      ),
    ).toBe(false)
  })

  it("recusa motivo curto", () => {
    expect(validateReversalInput("erro", "available").reason).toContain("5")
  })

  it("aceita apenas status de destino permitido", () => {
    expect(
      validateReversalInput("Motivo válido", "treatment").reason,
    ).toBeUndefined()
    expect(
      validateReversalInput("Motivo válido", "adopted" as never).reason,
    ).toBe("Escolha um status válido para o animal.")
  })
})
