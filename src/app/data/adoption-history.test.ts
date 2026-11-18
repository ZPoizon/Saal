import { describe, expect, it } from "vitest"

import type { AdoptionRecord } from "./animals"
import {
  filterAdoptionHistory,
  findActiveAdoption,
  getAdoptionHistoryStats,
  isAdoptionActive,
} from "./adoption-history"

const NOW = new Date("2026-03-01T00:00:00.000Z")

function makeAdoption(overrides: Partial<AdoptionRecord> = {}): AdoptionRecord {
  return {
    id: "adoption-1",
    animalId: "animal-1",
    animalName: "Rex",
    animalSpecies: "dog",
    animalSex: "macho",
    animalSize: "médio",
    animalAge: "3 anos",
    animalDescription: "Muito dócil.",
    animalMedicalInfo: "Vacinado.",
    animalPersonality: ["Dócil"],
    interestId: null,
    origin: "external",
    adopterName: "Maria Silva",
    adopterPhone: "15 99999-0000",
    adopterEmail: "maria@example.org",
    adoptionDate: "2026-02-20T00:00:00.000Z",
    notes: null,
    confirmedBy: null,
    confirmedAt: "2026-02-20T00:00:00.000Z",
    createdAt: "2026-02-20T00:00:00.000Z",
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

describe("estatísticas do histórico", () => {
  it("conta ativas, revertidas e estados de limpeza", () => {
    const stats = getAdoptionHistoryStats(
      [
        makeAdoption({ id: "a1" }),
        makeAdoption({ id: "a2", cleanupStatus: "completed" }),
        makeAdoption({
          id: "a3",
          reversedAt: "2026-02-25T00:00:00.000Z",
        }),
        makeAdoption({ id: "a4", cleanupStatus: "failed" }),
      ],
      NOW,
    )

    expect(stats).toMatchObject({
      total: 4,
      active: 3,
      reversed: 1,
      cleanupCompleted: 1,
      cleanupFailed: 1,
      cleanupPending: 1,
    })
  })

  it("identifica janela vencida e próxima do vencimento", () => {
    const stats = getAdoptionHistoryStats(
      [
        // 9 dias após a adoção: ainda fora da janela de 30 dias.
        makeAdoption({ id: "a1", adoptionDate: "2026-02-20T00:00:00.000Z" }),
        // 41 dias: vencida.
        makeAdoption({ id: "a2", adoptionDate: "2026-01-19T00:00:00.000Z" }),
        // 26 dias: vence em 4 dias.
        makeAdoption({ id: "a3", adoptionDate: "2026-02-03T00:00:00.000Z" }),
      ],
      NOW,
    )

    expect(stats.expiredPendingCleanup).toBe(1)
    expect(stats.expiringSoon).toBe(1)
  })

  it("não conta limpeza pendente de adoção revertida", () => {
    const stats = getAdoptionHistoryStats(
      [
        makeAdoption({
          reversedAt: "2026-02-25T00:00:00.000Z",
          adoptionDate: "2025-12-01T00:00:00.000Z",
        }),
      ],
      NOW,
    )

    expect(stats.cleanupPending).toBe(0)
    expect(stats.expiredPendingCleanup).toBe(0)
  })
})

describe("filtros do histórico", () => {
  const records = [
    makeAdoption({ id: "a1", animalName: "Rex", adopterName: "Maria" }),
    makeAdoption({
      id: "a2",
      animalName: "Luna",
      adopterName: "João",
      reversedAt: "2026-02-25T00:00:00.000Z",
    }),
    makeAdoption({
      id: "a3",
      animalName: "Mel",
      adopterName: "Ana",
      cleanupStatus: "failed",
    }),
  ]

  it("busca por animal, adotante ou contato", () => {
    expect(filterAdoptionHistory(records, { search: "luna" })).toHaveLength(1)
    expect(filterAdoptionHistory(records, { search: "joão" })).toHaveLength(1)
    expect(
      filterAdoptionHistory(records, { search: "maria@example" }),
    ).toHaveLength(3)
  })

  it("filtra por situação", () => {
    expect(filterAdoptionHistory(records, { status: "active" })).toHaveLength(2)
    expect(filterAdoptionHistory(records, { status: "reversed" })).toHaveLength(
      1,
    )
    expect(
      filterAdoptionHistory(records, { status: "cleanup-failed" }),
    ).toHaveLength(1)
    expect(
      filterAdoptionHistory(records, { status: "cleanup-pending" }),
    ).toHaveLength(1)
  })
})

describe("adoição ativa", () => {
  it("considera ativa apenas a que não foi revertida", () => {
    expect(isAdoptionActive(makeAdoption())).toBe(true)
    expect(
      isAdoptionActive(
        makeAdoption({ reversedAt: "2026-02-25T00:00:00.000Z" }),
      ),
    ).toBe(false)
  })

  it("encontra a adoção ativa do animal sem confundir com revertidas", () => {
    const records = [
      makeAdoption({
        id: "old",
        animalId: "animal-1",
        reversedAt: "2026-01-01T00:00:00.000Z",
      }),
      makeAdoption({ id: "current", animalId: "animal-1" }),
    ]

    expect(findActiveAdoption(records, "animal-1")?.id).toBe("current")
    expect(findActiveAdoption(records, "animal-2")).toBeNull()
  })
})
