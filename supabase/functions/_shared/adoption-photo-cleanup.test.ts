import { describe, expect, it, vi } from "vitest"

import {
  animalPhotoFileName,
  buildAnimalPhotoOwnership,
  confirmAnimalPhotoRemoval,
  isCleanupWindowExpired,
  isCleanupSecretValid,
  isValidAnimalPhotoPath,
  parseAnimalPhotoUrl,
  planAdoptionPhotoCleanup,
  runAdoptionPhotoCleanup,
  sanitizeCleanupError,
  type AdoptionCleanupCandidate,
  type AdoptionPhotoCleanupDependencies,
  type AdoptionPhotoCleanupReport,
  type CleanupAnimal,
} from "./adoption-photo-cleanup"

const SUPABASE_URL = "https://projeto.supabase.co"
const ANIMAL_ID = "11111111-1111-4111-8111-111111111111"
const OTHER_ANIMAL_ID = "22222222-2222-4222-8222-222222222222"
const PHOTO_ID = "33333333-3333-4333-8333-333333333333"
const SHARED_PHOTO_ID = "44444444-4444-4444-8444-444444444444"
const SECOND_PHOTO_ID = "55555555-5555-4555-8555-555555555555"

const PHOTO_PATH = `animals/${PHOTO_ID}.jpg`
const SHARED_PATH = `animals/${SHARED_PHOTO_ID}.png`
const SECOND_PHOTO_PATH = `animals/${SECOND_PHOTO_ID}.webp`

const NOW = new Date("2026-02-15T00:00:00.000Z")

function photoUrl(path: string, prefix = "public"): string {
  return `${SUPABASE_URL}/storage/v1/object/${prefix}/animal-photos/${path}`
}

const PHOTO_URL = photoUrl(PHOTO_PATH)
const SHARED_URL = photoUrl(SHARED_PATH)
const SECOND_PHOTO_URL = photoUrl(SECOND_PHOTO_PATH)

function makeAnimal(
  id: string,
  images: string[],
  overrides: Partial<CleanupAnimal> = {},
): CleanupAnimal {
  return {
    id,
    status: "adopted",
    images,
    ...overrides,
  }
}

function candidate(
  overrides: Partial<AdoptionCleanupCandidate> = {},
): AdoptionCleanupCandidate {
  return {
    adoptionId: "adoption-1",
    animalId: ANIMAL_ID,
    animalName: "Rex",
    adoptedAt: "2026-01-01T00:00:00.000Z",
    cleanupStatus: "pending",
    ...overrides,
  }
}

function dependencies(
  overrides: Partial<AdoptionPhotoCleanupDependencies> = {},
): AdoptionPhotoCleanupDependencies {
  return {
    listCandidates: vi.fn(async () => [candidate()]),
    listAnimals: vi.fn(async () => [makeAnimal(ANIMAL_ID, [PHOTO_URL])]),
    listPhotoReferences: vi.fn(async () => []),
    removePaths: vi.fn(async () => ({
      removed: [PHOTO_PATH],
      errors: [] as string[],
    })),
    recordCleanup: vi.fn(async () => undefined),
    ...overrides,
  }
}

function run(
  deps: AdoptionPhotoCleanupDependencies,
  now: Date = NOW,
): Promise<AdoptionPhotoCleanupReport> {
  return runAdoptionPhotoCleanup({ now, supabaseUrl: SUPABASE_URL }, deps)
}

describe("janela de 30 dias da limpeza", () => {
  it("mantém o animal elegível apenas a partir dos 30 dias completos", () => {
    const adoptedAt = "2026-01-16T00:00:00.000Z"

    expect(
      isCleanupWindowExpired(adoptedAt, new Date("2026-01-26T00:00:00.000Z")),
    ).toBe(false)
    expect(
      isCleanupWindowExpired(adoptedAt, new Date("2026-02-14T00:00:00.000Z")),
    ).toBe(false)
    expect(
      isCleanupWindowExpired(adoptedAt, new Date("2026-02-15T00:00:00.000Z")),
    ).toBe(true)
    expect(
      isCleanupWindowExpired(adoptedAt, new Date("2026-02-16T00:00:00.000Z")),
    ).toBe(true)
  })

  it("nunca expira adoção sem data real conhecida", () => {
    expect(isCleanupWindowExpired(null, NOW)).toBe(false)
    expect(isCleanupWindowExpired("invalida", NOW)).toBe(false)
  })
})

describe("validação de caminhos do bucket animal-photos", () => {
  it("aceita apenas animals/<uuid>.<ext>", () => {
    expect(isValidAnimalPhotoPath(PHOTO_PATH)).toBe(true)
    expect(isValidAnimalPhotoPath(`animals/${PHOTO_ID}.jpeg`)).toBe(true)
    expect(isValidAnimalPhotoPath("animals/outro.jpg")).toBe(false)
    expect(isValidAnimalPhotoPath(`animals/../${PHOTO_ID}.jpg`)).toBe(false)
    expect(isValidAnimalPhotoPath(`animals\\${PHOTO_ID}.jpg`)).toBe(false)
    expect(isValidAnimalPhotoPath(`${PHOTO_ID}.jpg`)).toBe(false)
  })

  it("extrai o caminho de uma URL pública do próprio projeto", () => {
    expect(parseAnimalPhotoUrl(PHOTO_URL, SUPABASE_URL)).toEqual({
      ok: true,
      bucket: "animal-photos",
      path: PHOTO_PATH,
    })
  })

  it("aceita URLs assinadas e de renderização do bucket correto", () => {
    expect(
      parseAnimalPhotoUrl(photoUrl(PHOTO_PATH, "sign"), SUPABASE_URL),
    ).toMatchObject({ ok: true, path: PHOTO_PATH })

    expect(
      parseAnimalPhotoUrl(
        `${SUPABASE_URL}/storage/v1/render/image/public/animal-photos/${PHOTO_PATH}`,
        SUPABASE_URL,
      ),
    ).toMatchObject({ ok: true, path: PHOTO_PATH })
  })

  it("recusa outro domínio, outro bucket e caminho inválido", () => {
    expect(
      parseAnimalPhotoUrl(
        `https://outro.example/storage/v1/object/public/animal-photos/${PHOTO_PATH}`,
        SUPABASE_URL,
      ),
    ).toEqual({ ok: false, reason: "external-url" })

    expect(
      parseAnimalPhotoUrl(
        `${SUPABASE_URL}/storage/v1/object/public/outro-bucket/${PHOTO_PATH}`,
        SUPABASE_URL,
      ),
    ).toEqual({ ok: false, reason: "wrong-bucket" })

    expect(
      parseAnimalPhotoUrl(
        `${SUPABASE_URL}/storage/v1/object/public/animal-photos/animals/invalido.jpg`,
        SUPABASE_URL,
      ),
    ).toEqual({ ok: false, reason: "invalid-path" })
  })
})

describe("confirmação física da remoção no Storage", () => {
  it("aceita quando remove devolve o próprio caminho", () => {
    expect(
      confirmAnimalPhotoRemoval(PHOTO_PATH, {
        removedNames: [PHOTO_PATH],
        listing: [],
      }),
    ).toEqual({ confirmed: true, reason: null })
  })

  it("confirma pela listagem quando remove não devolve o arquivo", () => {
    expect(
      confirmAnimalPhotoRemoval(PHOTO_PATH, {
        removedNames: [],
        listing: [],
      }),
    ).toEqual({ confirmed: true, reason: null })
  })

  it("recusa quando o arquivo continua listado no bucket", () => {
    const result = confirmAnimalPhotoRemoval(PHOTO_PATH, {
      removedNames: [],
      listing: [{ name: `${PHOTO_ID}.jpg` }],
    })

    expect(result.confirmed).toBe(false)
    expect(result.reason).toContain("ainda lista")
  })

  it("recusa caminho inválido mesmo com listagem vazia", () => {
    const result = confirmAnimalPhotoRemoval("animals/invalido.jpg", {
      removedNames: [],
      listing: [],
    })

    expect(result.confirmed).toBe(false)
    expect(result.reason).toContain("inválido")
  })

  it("extrai o nome do arquivo apenas de caminhos válidos", () => {
    expect(animalPhotoFileName(PHOTO_PATH)).toBe(`${PHOTO_ID}.jpg`)
    expect(animalPhotoFileName(`animals\\${PHOTO_ID}.jpg`)).toBeNull()
    expect(animalPhotoFileName("outro/arquivo.jpg")).toBeNull()
  })
})

describe("propriedade das fotos", () => {
  it("marca como compartilhado o caminho citado por mais de um animal", () => {
    const ownership = buildAnimalPhotoOwnership(
      [
        makeAnimal(ANIMAL_ID, [PHOTO_URL, SHARED_URL]),
        makeAnimal(OTHER_ANIMAL_ID, [SHARED_URL]),
      ],
      [{ animalId: ANIMAL_ID, storagePath: PHOTO_PATH }],
      SUPABASE_URL,
    )

    expect(ownership.animalsByPath.get(PHOTO_PATH)).toEqual(
      new Set([ANIMAL_ID]),
    )
    expect(ownership.animalsByPath.get(SHARED_PATH)).toEqual(
      new Set([ANIMAL_ID, OTHER_ANIMAL_ID]),
    )
    expect(ownership.referencesByAnimal.get(ANIMAL_ID)).toEqual([
      PHOTO_PATH,
      SHARED_PATH,
    ])
  })
})

describe("planejamento da limpeza", () => {
  const animals = [
    makeAnimal(ANIMAL_ID, [
      PHOTO_URL,
      SHARED_URL,
      "https://images.example.com/externa.jpg",
    ]),
    makeAnimal(OTHER_ANIMAL_ID, [SHARED_URL]),
  ]

  const ownership = buildAnimalPhotoOwnership(animals, [], SUPABASE_URL)

  it("separa fotos removíveis, compartilhadas e inválidas", () => {
    const plan = planAdoptionPhotoCleanup(
      candidate(),
      animals,
      ownership,
      SUPABASE_URL,
      NOW,
    )

    expect(plan.expired).toBe(true)
    expect(plan.removable.map((photo) => photo.path)).toEqual([PHOTO_PATH])
    expect(plan.shared.map((photo) => photo.path)).toEqual([SHARED_PATH])
    expect(plan.invalid.map((photo) => photo.reason)).toEqual(["external-url"])
  })

  it("não planeja remoção antes do fim da janela", () => {
    const plan = planAdoptionPhotoCleanup(
      candidate({ adoptedAt: "2026-02-01T00:00:00.000Z" }),
      animals,
      ownership,
      SUPABASE_URL,
      NOW,
    )

    expect(plan.expired).toBe(false)
  })

  it("trata adoção sem data conhecida como não expirada", () => {
    const plan = planAdoptionPhotoCleanup(
      candidate({ adoptedAt: null }),
      animals,
      ownership,
      SUPABASE_URL,
      NOW,
    )

    expect(plan.expired).toBe(false)
    expect(plan.deadline).toBeNull()
  })
})

describe("execução automática da limpeza", () => {
  it("executa sem sessão administrativa e registra a conclusão", async () => {
    const deps = dependencies()

    const report = await run(deps)

    expect(deps.removePaths).toHaveBeenCalledWith([PHOTO_PATH])
    expect(deps.recordCleanup).toHaveBeenCalledWith(
      "adoption-1",
      "completed",
      [PHOTO_URL],
      null,
    )
    expect(report).toMatchObject({ checked: 1, completed: 1, failed: 0 })
  })

  it("não toca em nada quando não há candidatos", async () => {
    const deps = dependencies({ listCandidates: vi.fn(async () => []) })

    const report = await run(deps)

    expect(report.items).toEqual([])
    expect(deps.listAnimals).not.toHaveBeenCalled()
    expect(deps.listPhotoReferences).not.toHaveBeenCalled()
    expect(deps.removePaths).not.toHaveBeenCalled()
  })

  it("não remove fotos de adoção com 29 dias", async () => {
    const deps = dependencies({
      listCandidates: vi.fn(async () => [
        candidate({ adoptedAt: "2026-01-17T00:00:00.000Z" }),
      ]),
    })

    const report = await run(deps)

    expect(report).toMatchObject({ checked: 1, skipped: 1, completed: 0 })
    expect(deps.removePaths).not.toHaveBeenCalled()
    expect(deps.recordCleanup).not.toHaveBeenCalled()
  })

  it("remove fotos de adoção com 30 e 31 dias", async () => {
    for (const adoptedAt of [
      "2026-01-16T00:00:00.000Z",
      "2026-01-15T00:00:00.000Z",
    ]) {
      const deps = dependencies({
        listCandidates: vi.fn(async () => [candidate({ adoptedAt })]),
      })

      const report = await run(deps)

      expect(report).toMatchObject({ completed: 1, failed: 0 })
      expect(deps.removePaths).toHaveBeenCalledWith([PHOTO_PATH])
    }
  })

  it("não apaga foto compartilhada com outro animal", async () => {
    const deps = dependencies({
      listAnimals: vi.fn(async () => [
        makeAnimal(ANIMAL_ID, [PHOTO_URL, SHARED_URL]),
        makeAnimal(OTHER_ANIMAL_ID, [SHARED_URL]),
      ]),
    })

    const report = await run(deps)

    expect(deps.removePaths).not.toHaveBeenCalled()
    expect(deps.recordCleanup).toHaveBeenCalledWith(
      "adoption-1",
      "failed",
      [],
      expect.stringContaining("compartilhadas"),
    )
    expect(report).toMatchObject({ completed: 0, failed: 1 })
  })

  it("não apaga foto que pertence somente a outro animal", async () => {
    const deps = dependencies({
      listAnimals: vi.fn(async () => [
        // O animal adotado não referencia mais a foto.
        makeAnimal(ANIMAL_ID, []),
        makeAnimal(OTHER_ANIMAL_ID, [PHOTO_URL]),
      ]),
    })

    const report = await run(deps)

    expect(deps.removePaths).not.toHaveBeenCalled()
    // Sem fotos removíveis, apenas confirma a conclusão sem apagar arquivo.
    expect(deps.recordCleanup).toHaveBeenCalledWith(
      "adoption-1",
      "completed",
      [],
      null,
    )
    expect(report).toMatchObject({ completed: 1 })
  })

  it("registra falha parcial e permite nova tentativa", async () => {
    const firstAttempt = dependencies({
      listAnimals: vi.fn(async () => [
        makeAnimal(ANIMAL_ID, [PHOTO_URL, SECOND_PHOTO_URL]),
      ]),
      removePaths: vi.fn(async () => ({
        removed: [PHOTO_PATH],
        errors: ["Falha ao remover o segundo arquivo."],
      })),
    })

    const firstReport = await run(firstAttempt)

    expect(firstReport).toMatchObject({ completed: 0, failed: 1 })
    expect(firstAttempt.recordCleanup).toHaveBeenCalledWith(
      "adoption-1",
      "failed",
      [PHOTO_URL],
      expect.stringContaining("Falha ao remover"),
    )

    const secondAttempt = dependencies({
      listCandidates: vi.fn(async () => [
        candidate({ cleanupStatus: "failed" }),
      ]),
      listAnimals: vi.fn(async () => [
        makeAnimal(ANIMAL_ID, [SECOND_PHOTO_URL]),
      ]),
      removePaths: vi.fn(async () => ({
        removed: [SECOND_PHOTO_PATH],
        errors: [] as string[],
      })),
    })

    const secondReport = await run(secondAttempt)

    expect(secondAttempt.removePaths).toHaveBeenCalledWith([SECOND_PHOTO_PATH])
    expect(secondAttempt.recordCleanup).toHaveBeenCalledWith(
      "adoption-1",
      "completed",
      [SECOND_PHOTO_URL],
      null,
    )
    expect(secondReport).toMatchObject({ completed: 1, failed: 0 })
  })

  it("remove apenas os arquivos do animal correto em um Storage isolado", async () => {
    const bucket = new Map([
      [PHOTO_PATH, true],
      [SECOND_PHOTO_PATH, true],
    ])

    const deps = dependencies({
      listAnimals: vi.fn(async () => [
        makeAnimal(ANIMAL_ID, [PHOTO_URL]),
        makeAnimal(OTHER_ANIMAL_ID, [SECOND_PHOTO_URL]),
      ]),
      removePaths: vi.fn(async (paths: string[]) => ({
        removed: paths.filter((path) => bucket.delete(path)),
        errors: [] as string[],
      })),
    })

    const report = await run(deps)

    expect(deps.removePaths).toHaveBeenCalledWith([PHOTO_PATH])
    expect(report).toMatchObject({ completed: 1, failed: 0 })
    expect(bucket.has(PHOTO_PATH)).toBe(false)
    expect(bucket.has(SECOND_PHOTO_PATH)).toBe(true)
  })

  it("é idempotente quando a limpeza já foi concluída", async () => {
    const deps = dependencies({
      listCandidates: vi.fn(async () => [
        candidate({ cleanupStatus: "completed" }),
      ]),
    })

    const report = await run(deps)

    expect(report).toMatchObject({ checked: 1, skipped: 1, completed: 0 })
    expect(deps.removePaths).not.toHaveBeenCalled()
    expect(deps.recordCleanup).not.toHaveBeenCalled()
  })

  it("cancela a elegibilidade de adoção revertida", async () => {
    const deps = dependencies({
      listCandidates: vi.fn(async () => [
        candidate({ cleanupStatus: "cancelled" }),
      ]),
    })

    const report = await run(deps)

    expect(report).toMatchObject({ skipped: 1 })
    expect(deps.removePaths).not.toHaveBeenCalled()
  })

  it("não processa animal que deixou de estar adotado", async () => {
    const deps = dependencies({
      listAnimals: vi.fn(async () => [
        makeAnimal(ANIMAL_ID, [PHOTO_URL], { status: "available" }),
      ]),
    })

    const report = await run(deps)

    expect(report).toMatchObject({ skipped: 1, completed: 0 })
    expect(deps.removePaths).not.toHaveBeenCalled()
  })

  it("protege adoção legada sem data de qualquer exclusão", async () => {
    const deps = dependencies({
      listCandidates: vi.fn(async () => [candidate({ adoptedAt: null })]),
    })

    const report = await run(deps)

    expect(report).toMatchObject({ skipped: 1 })
    expect(deps.removePaths).not.toHaveBeenCalled()
  })

  it("não interrompe a rotina quando o registro do resultado falha", async () => {
    const deps = dependencies({
      recordCleanup: vi.fn(async () => {
        throw new Error("Falha ao registrar.")
      }),
    })

    const report = await run(deps)

    expect(report).toMatchObject({ completed: 0, failed: 1 })
    expect(report.items[0].reason).toContain("Falha ao registrar")
  })
})

describe("mensagens de erro da limpeza", () => {
  it("trunca mensagens longas e usa fallback", () => {
    expect(sanitizeCleanupError(new Error("x".repeat(900)))).toHaveLength(500)
    expect(sanitizeCleanupError("falha")).toBe(
      "Falha não identificada durante a limpeza das fotos.",
    )
  })
})

describe("autorização da rotina agendada", () => {
  it("aceita apenas o segredo exato configurado no servidor", () => {
    expect(isCleanupSecretValid("segredo-forte", "segredo-forte")).toBe(true)
    expect(isCleanupSecretValid("segredo-forte", "segredo-fort3")).toBe(false)
    expect(isCleanupSecretValid("segredo-forte", "segredo")).toBe(false)
  })

  it("falha fechado quando o servidor não tem segredo", () => {
    expect(isCleanupSecretValid(null, "qualquer")).toBe(false)
    expect(isCleanupSecretValid(undefined, "qualquer")).toBe(false)
    expect(isCleanupSecretValid("", "qualquer")).toBe(false)
  })

  it("recusa chamada sem cabeçalho de segredo", () => {
    expect(isCleanupSecretValid("segredo-forte", null)).toBe(false)
    expect(isCleanupSecretValid("segredo-forte", "")).toBe(false)
  })
})
