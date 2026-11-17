import type {
  AdminAnimalInterest,
  AnimalInterestInput,
  AnimalInterestReceipt,
} from "../data/interests"

import {
  browserStorage,
  loadLocalAnimals,
  loadLocalInterests,
  nextLocalId,
  saveLocalInterests,
} from "../data/local-store"

/**
 * Manifestações de interesse em modo protótipo local (sem API).
 *
 * O envio grava o registro somente no `localStorage` deste navegador; nada é
 * transmitido à ONG. Os dados pessoais permanecem no dispositivo do visitante.
 * Quando a API for religada, `submitAnimalInterest` volta a usar
 * `POST /api/v1/animals/{id}/interests` (ADR-008).
 */

export class InterestApiError extends Error {
  constructor(readonly status: number) {
    super(`A API de interesses respondeu com HTTP ${status}.`)

    this.name = "InterestApiError"
  }
}

/** Envio público local: grava o registro apenas neste navegador. */

export async function submitAnimalInterest(
  animalId: string,

  input: AnimalInterestInput,

  storage: Storage = browserStorage(),
): Promise<AnimalInterestReceipt> {
  const animals = loadLocalAnimals(storage)

  const interests = loadLocalInterests(storage)

  const animal = animals.find((candidate) => candidate.id === animalId)

  if (!animal) {
    throw new InterestApiError(404)
  }

  const createdAt = new Date().toISOString()

  const record: AdminAnimalInterest = {
    id: nextLocalId(interests.map((candidate) => candidate.id)),

    animalId,

    animalName: animal.name,

    fullName: input.fullName.trim(),

    whatsapp: input.whatsapp.trim(),

    city: input.city.trim(),

    email: input.email.trim(),

    createdAt,
  }

  saveLocalInterests(storage, [record, ...interests])

  return { received: true, createdAt }
}

/** Consulta administrativa local: todos os interessados, mais recentes primeiro. */

export async function listAdminInterests(
  storage: Storage = browserStorage(),
): Promise<AdminAnimalInterest[]> {
  return loadLocalInterests(storage)
}

/** Consulta administrativa local dos interessados de um animal específico. */

export async function listAdminInterestsByAnimal(
  animalId: string,

  storage: Storage = browserStorage(),
): Promise<AdminAnimalInterest[]> {
  const interests = loadLocalInterests(storage)

  return interests.filter((interest) => interest.animalId === animalId)
}
