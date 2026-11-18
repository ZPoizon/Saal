import { describe, expect, it } from "vitest"

import {
  ADOPTION_PHOTO_RETENTION_DAYS,
  canConfirmAdoption,
  canReceiveInterests,
  getAdoptionPhotoDeadline,
  hasKnownAdoptionDate,
  isAdoptionPhotoWindowExpired,
  isAnimalPubliclyVisible,
  isLegacyAdoption,
  formatAdoptionDate,
  requiresAdoptionReversal,
  type Animal,
} from "./animals"

const ADOPTED_AT = "2026-01-01T00:00:00.000Z"

function at(days: number): Date {
  return new Date(Date.parse(ADOPTED_AT) + days * 24 * 60 * 60 * 1000)
}

function makeAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: "animal-1",
    name: "Luna",
    species: "cat",
    age: "2 anos",
    size: "pequeno",
    sex: "fêmea",
    status: "adopted",
    description: "Gata dócil.",
    personality: [],
    medicalInfo: "",
    images: [],
    adoptedAt: ADOPTED_AT,
    archivedAt: null,
    ...overrides,
  }
}

describe("janela de 30 dias das fotos", () => {
  it("não expira no 10º dia", () => {
    expect(isAdoptionPhotoWindowExpired(ADOPTED_AT, at(10))).toBe(false)
  })

  it("não expira no 29º dia", () => {
    expect(isAdoptionPhotoWindowExpired(ADOPTED_AT, at(29))).toBe(false)
  })

  it("expira exatamente aos 30 dias completos", () => {
    expect(isAdoptionPhotoWindowExpired(ADOPTED_AT, at(30))).toBe(true)
  })

  it("permanece expirada no 31º dia", () => {
    expect(isAdoptionPhotoWindowExpired(ADOPTED_AT, at(31))).toBe(true)
  })

  it("nunca expira quando a data real é desconhecida", () => {
    expect(isAdoptionPhotoWindowExpired(null, at(3650))).toBe(false)
  })

  it("calcula o limite a partir da data real da adoção", () => {
    expect(getAdoptionPhotoDeadline(ADOPTED_AT)?.toISOString()).toBe(
      at(ADOPTION_PHOTO_RETENTION_DAYS).toISOString(),
    )
  })

  it("não calcula limite para data ausente ou inválida", () => {
    expect(getAdoptionPhotoDeadline(null)).toBeNull()
    expect(getAdoptionPhotoDeadline("data-invalida")).toBeNull()
  })
})

describe("visibilidade do catálogo público", () => {
  it("mantém disponíveis e em tratamento sempre visíveis", () => {
    expect(
      isAnimalPubliclyVisible(
        { status: "available", adoptedAt: null },
        at(365),
      ),
    ).toBe(true)
    expect(
      isAnimalPubliclyVisible(
        { status: "treatment", adoptedAt: null },
        at(365),
      ),
    ).toBe(true)
  })

  it("mostra o adotado durante a janela e o oculta após 30 dias", () => {
    const animal = makeAnimal()

    expect(isAnimalPubliclyVisible(animal, at(10))).toBe(true)
    expect(isAnimalPubliclyVisible(animal, at(29))).toBe(true)
    expect(isAnimalPubliclyVisible(animal, at(30))).toBe(false)
    expect(isAnimalPubliclyVisible(animal, at(31))).toBe(false)
  })

  it("mantém visível a adoção legada sem data real", () => {
    expect(
      isAnimalPubliclyVisible({ status: "adopted", adoptedAt: null }, at(3650)),
    ).toBe(true)
  })
})

describe("regras de transição de status", () => {
  it("aceita manifestações apenas para animais disponíveis", () => {
    expect(canReceiveInterests({ status: "available" })).toBe(true)
    expect(canReceiveInterests({ status: "treatment" })).toBe(false)
    expect(canReceiveInterests({ status: "adopted" })).toBe(false)
  })

  it("permite confirmar adoção de disponíveis e em tratamento", () => {
    expect(canConfirmAdoption({ status: "available" })).toBe(true)
    expect(canConfirmAdoption({ status: "treatment" })).toBe(true)
    expect(canConfirmAdoption({ status: "adopted" })).toBe(false)
  })

  it("exige reversão para sair do status adotado", () => {
    expect(requiresAdoptionReversal({ status: "adopted" })).toBe(true)
    expect(requiresAdoptionReversal({ status: "available" })).toBe(false)
    expect(requiresAdoptionReversal({ status: "treatment" })).toBe(false)
  })

  it("identifica adoção legada sem inventar uma data", () => {
    expect(isLegacyAdoption({ status: "adopted", adoptedAt: null })).toBe(true)
    expect(isLegacyAdoption({ status: "adopted", adoptedAt: ADOPTED_AT })).toBe(
      false,
    )
    expect(isLegacyAdoption({ status: "available", adoptedAt: null })).toBe(
      false,
    )
    expect(hasKnownAdoptionDate({ adoptedAt: ADOPTED_AT })).toBe(true)
    expect(hasKnownAdoptionDate({ adoptedAt: "invalida" })).toBe(false)
  })
})

describe("formatação de datas", () => {
  it("formata a data real em UTC sem deslocar o dia", () => {
    expect(formatAdoptionDate(ADOPTED_AT)).toBe("01/01/2026")
  })

  it("informa quando não há data registrada", () => {
    expect(formatAdoptionDate(null)).toBe("Data não registrada")
  })
})
