import { describe, expect, it } from "vitest"

import type { AdoptionRecord, Animal } from "./animals"
import { buildAdoptionHistoryDetails } from "./adoption-history-details"

function makeAdoption(overrides: Partial<AdoptionRecord> = {}): AdoptionRecord {
  return {
    id: "adoption-1",
    animalId: "animal-1",
    animalName: "Rex",
    animalSpecies: "dog",
    animalSex: "macho",
    animalSize: "médio",
    animalAge: "3 anos",
    animalDescription: "Muito dócil e brincalhão.",
    animalMedicalInfo: "Vacinado e castrado.",
    animalPersonality: ["Brincalhão", "Leal"],
    interestId: "interest-1",
    origin: "site",
    adopterName: "Maria Silva",
    adopterPhone: "15 99999-0000",
    adopterEmail: "maria@example.org",
    adoptionDate: "2026-01-10T00:00:00.000Z",
    notes: "Adoção acompanhada pela equipe.",
    confirmedBy: "admin-1",
    confirmedAt: "2026-01-11T00:00:00.000Z",
    createdAt: "2026-01-11T00:00:00.000Z",
    reversedAt: null,
    reversedBy: null,
    reversalReason: null,
    cleanupStatus: "pending",
    cleanupError: null,
    cleanupAttemptedAt: null,
    cleanupCompletedAt: null,
    ...overrides,
  }
}

function makeAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: "animal-1",
    name: "Rex",
    species: "dog",
    age: "5 anos",
    size: "grande",
    sex: "macho",
    status: "adopted",
    description: "Descrição atual do cadastro.",
    personality: ["brincalhão"],
    medicalInfo: "Informação médica atual.",
    images: [
      "https://projeto.supabase.co/storage/v1/object/public/animal-photos/animals/33333333-3333-4333-8333-333333333333.jpg",
    ],
    adoptedAt: "2026-01-10T00:00:00.000Z",
    archivedAt: null,
    ...overrides,
  }
}

describe("detalhes textuais do histórico de adoções", () => {
  it("prioriza os snapshots gravados na confirmação", () => {
    const details = buildAdoptionHistoryDetails(makeAdoption(), makeAnimal())

    expect(details.animal).toMatchObject({
      name: "Rex",
      species: "Canino",
      sex: "Macho",
      size: "Médio",
      age: "3 anos",
      description: "Muito dócil e brincalhão.",
      medicalInfo: "Vacinado e castrado.",
      personality: "Brincalhão, Leal",
    })
  })

  it("usa a personalidade do cadastro quando o snapshot é nulo", () => {
    const details = buildAdoptionHistoryDetails(
      makeAdoption({ animalPersonality: null }),
      makeAnimal({ personality: ["Calmo", "Curioso"] }),
    )

    expect(details.animal.personality).toBe("Calmo, Curioso")
  })

  it("preserva a personalidade vazia do snapshot em vez de usar o cadastro", () => {
    const details = buildAdoptionHistoryDetails(
      makeAdoption({ animalPersonality: [] }),
      makeAnimal({ personality: ["Calmo"] }),
    )

    expect(details.animal.personality).toBeNull()
  })

  it("usa o cadastro atual quando a adoção antiga não tem snapshot", () => {
    const details = buildAdoptionHistoryDetails(
      makeAdoption({
        animalSpecies: null,
        animalSex: null,
        animalSize: null,
        animalAge: null,
        animalDescription: null,
        animalMedicalInfo: null,
        animalPersonality: null,
      }),
      makeAnimal(),
    )

    expect(details.animal).toMatchObject({
      species: "Canino",
      size: "Grande",
      age: "5 anos",
      description: "Descrição atual do cadastro.",
      medicalInfo: "Informação médica atual.",
      personality: "brincalhão",
    })
  })

  it("continua legível quando o cadastro do animal não existe mais", () => {
    const details = buildAdoptionHistoryDetails(makeAdoption(), null)

    expect(details.animal.name).toBe("Rex")
    expect(details.animal.age).toBe("3 anos")
    expect(details.adopterName).toBe("Maria Silva")
  })

  it("resume origem, contato e situação da adoção", () => {
    const details = buildAdoptionHistoryDetails(makeAdoption(), makeAnimal())

    expect(details.origin).toBe("Pelo site")
    expect(details.contacts).toEqual(["15 99999-0000", "maria@example.org"])
    expect(details.isActive).toBe(true)
    expect(details.notes).toBe("Adoção acompanhada pela equipe.")
  })

  it("identifica adoção presencial revertida", () => {
    const details = buildAdoptionHistoryDetails(
      makeAdoption({
        origin: "external",
        adopterPhone: null,
        adopterEmail: "maria@example.org",
        reversedAt: "2026-02-01T00:00:00.000Z",
        reversalReason: "Tutela devolveu o animal.",
      }),
      null,
    )

    expect(details.origin).toBe("Presencial")
    expect(details.contacts).toEqual(["maria@example.org"])
    expect(details.isActive).toBe(false)
    expect(details.reversalReason).toBe("Tutela devolveu o animal.")
  })

  it("omite campos vazios em vez de exibir texto em branco", () => {
    const details = buildAdoptionHistoryDetails(
      makeAdoption({
        animalDescription: "   ",
        animalMedicalInfo: "",
        notes: "  ",
        adopterPhone: null,
        adopterEmail: null,
      }),
      null,
    )

    expect(details.animal.description).toBeNull()
    expect(details.animal.medicalInfo).toBeNull()
    expect(details.notes).toBeNull()
    expect(details.contacts).toEqual([])
  })

  it("não expõe fotografias, URLs ou caminhos do Storage", () => {
    const details = buildAdoptionHistoryDetails(makeAdoption(), makeAnimal())
    const serialized = JSON.stringify(details)

    expect(serialized).not.toMatch(/https?:\/\//i)
    expect(serialized).not.toMatch(/storage/i)
    expect(serialized).not.toMatch(/"images?"/i)
    expect(serialized).not.toMatch(/"photos?"/i)
  })
})
