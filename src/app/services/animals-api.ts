import {
  isAnimalPubliclyVisible,
  type Animal,
  type AnimalInput,
} from "../data/animals"

import {
  browserStorage,
  loadLocalAnimals,
  nextLocalId,
  saveLocalAnimals,
} from "../data/local-store"

import { kindFromStatus, type FailureKind } from "./supabase-errors"

/**
 * Catálogo em modo protótipo local (sem API).
 *
 * Lê e escreve os animais no `localStorage` do navegador. Nenhum dado chega a
 * um servidor: os cadastros valem apenas neste navegador e dispositivo. A
 * integração real com a API está registrada em `specs/contracts/openapi.yaml`
 * e volta a valer quando o modo local for desligado (ADR-008).
 */

export interface AnimalApiErrorOptions {
  /** Código PostgREST original, quando a falha veio do Supabase. */

  code?: string

  /** Tipo de falha já classificado; inferido do status quando omitido. */

  kind?: FailureKind

  /** Mensagem técnica original, para diagnóstico seguro. */

  message?: string
}

export class AnimalApiError extends Error {
  readonly kind: FailureKind

  readonly code?: string

  constructor(
    readonly status: number,

    options: AnimalApiErrorOptions = {},
  ) {
    super(options.message ?? `A API de animais respondeu com HTTP ${status}.`)

    this.name = "AnimalApiError"

    this.code = options.code

    this.kind = options.kind ?? kindFromStatus(status)
  }
}

function localAnimalFromInput(
  input: AnimalInput,

  id: string,

  previous?: Animal,
): Animal {
  return {
    id,

    name: input.name,

    species: input.species,

    age: input.age,

    size: input.size,

    sex: input.sex,

    status: input.status,

    description: input.description,

    personality: input.personality,

    medicalInfo: input.medicalInfo,

    images: input.images,

    adoptedAt:
      input.status === "adopted" ? (previous?.adoptedAt ?? null) : null,

    archivedAt:
      input.status === "adopted" ? (previous?.archivedAt ?? null) : null,
  }
}

/**
 * Catálogo público local: inclui disponíveis, animais em tratamento e
 * adotados cuja janela de 30 dias ainda não terminou. Adotados sem data real
 * (legado) permanecem visíveis.
 */

export async function listPublicAnimals(
  storage: Storage = browserStorage(),
): Promise<Animal[]> {
  const animals = loadLocalAnimals(storage)

  return animals.filter((animal) => isAnimalPubliclyVisible(animal))
}

/** Detalhe público local: respeita a janela de visibilidade do catálogo. */

export async function getPublicAnimal(
  id: string,

  storage: Storage = browserStorage(),
): Promise<Animal> {
  const animals = loadLocalAnimals(storage)

  const animal = animals.find((candidate) => candidate.id === id)

  if (!animal || !isAnimalPubliclyVisible(animal)) {
    throw new AnimalApiError(404)
  }

  return animal
}

/** Listagem administrativa local: inclui disponiveis e adotados. */

export async function listAdminAnimals(
  storage: Storage = browserStorage(),
): Promise<Animal[]> {
  return loadLocalAnimals(storage)
}

export async function getAdminAnimal(
  id: string,

  storage: Storage = browserStorage(),
): Promise<Animal> {
  const animals = loadLocalAnimals(storage)

  const animal = animals.find((candidate) => candidate.id === id)

  if (!animal) {
    throw new AnimalApiError(404)
  }

  return animal
}

export async function createAnimal(
  input: AnimalInput,

  storage: Storage = browserStorage(),
): Promise<Animal> {
  if (input.status === "adopted") {
    throw new AnimalApiError(409, {
      kind: "forbidden",

      message: "Adoções devem ser registradas pelo fluxo de confirmação.",
    })
  }

  const animals = loadLocalAnimals(storage)

  const animal = localAnimalFromInput(
    input,

    nextLocalId(animals.map((candidate) => candidate.id)),
  )

  saveLocalAnimals(storage, [...animals, animal])

  return animal
}

export async function updateAnimal(
  id: string,

  input: AnimalInput,

  storage: Storage = browserStorage(),
): Promise<Animal> {
  const animals = loadLocalAnimals(storage)

  const index = animals.findIndex((candidate) => candidate.id === id)

  if (index === -1) {
    throw new AnimalApiError(404)
  }

  const current = animals[index] as Animal

  // Adoção nunca é gravada por edição direta, mesmo no modo local: o fluxo de

  // confirmação é a única origem válida do status "adopted".

  if (input.status === "adopted" && current.status !== "adopted") {
    throw new AnimalApiError(409, {
      kind: "forbidden",

      message: "Adoções devem ser registradas pelo fluxo de confirmação.",
    })
  }

  if (current.status === "adopted" && input.status !== "adopted") {
    throw new AnimalApiError(409, {
      kind: "forbidden",

      message: "Reverta a adoção com justificativa antes de alterar o status.",
    })
  }

  const updated = localAnimalFromInput(input, id, current)

  const next = [...animals]

  next[index] = updated

  saveLocalAnimals(storage, next)

  return updated
}

/**
 * Exclusão local, habilitada por decisão do responsável (ADR-008): remove o
 * animal do catálogo deste navegador. Manifestações de interesse anteriores
 * mantêm o nome do animal, pois ele é copiado no registro. A exclusão
 * definitiva/arquivamento no modo com API continua pendente (ONG-03).
 */

export async function deleteAnimal(
  id: string,

  storage: Storage = browserStorage(),
): Promise<void> {
  const animals = loadLocalAnimals(storage)

  const next = animals.filter((candidate) => candidate.id !== id)

  if (next.length === animals.length) {
    throw new AnimalApiError(404)
  }

  saveLocalAnimals(storage, next)
}
