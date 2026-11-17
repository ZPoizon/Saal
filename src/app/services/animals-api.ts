import type { Animal, AnimalInput } from "../data/animals"

import {
  browserStorage,
  loadLocalAnimals,
  nextLocalId,
  saveLocalAnimals,
} from "../data/local-store"

/**
 * Catálogo em modo protótipo local (sem API).
 *
 * Lê e escreve os animais no `localStorage` do navegador. Nenhum dado chega a
 * um servidor: os cadastros valem apenas neste navegador e dispositivo. A
 * integração real com a API está registrada em `specs/contracts/openapi.yaml`
 * e volta a valer quando o modo local for desligado (ADR-008).
 */

export class AnimalApiError extends Error {
  constructor(readonly status: number) {
    super(`A API de animais respondeu com HTTP ${status}.`)

    this.name = "AnimalApiError"
  }
}

function localAnimalFromInput(input: AnimalInput, id: string): Animal {
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
  }
}

/** Catálogo público local: somente animais disponiveis. */

export async function listPublicAnimals(
  storage: Storage = browserStorage(),
): Promise<Animal[]> {
  const animals = loadLocalAnimals(storage)

  return animals.filter((animal) => animal.status === "available")
}

/** Detalhe público local: aceita qualquer estado (inclusive adotados). */

export async function getPublicAnimal(
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
  return getPublicAnimal(id, storage)
}

export async function createAnimal(
  input: AnimalInput,

  storage: Storage = browserStorage(),
): Promise<Animal> {
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

  const updated = localAnimalFromInput(input, id)

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
