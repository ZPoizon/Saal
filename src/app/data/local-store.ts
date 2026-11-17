import type { AdminAnimalInterest } from "./interests"

import type { Animal } from "./animals"

import { mockAnimals } from "./mock-animals"

/**
 * Persistência local do modo protótipo (sem API).
 *
 * Os registros ficam no `localStorage` do navegador. Nada aqui é enviado a um
 * servidor: outros visitantes e outros dispositivos não veem essas alterações.
 * Quando a integração com a API for religada, este módulo deixa de ser usado.
 */

export const LOCAL_ANIMALS_STORAGE_KEY = "saal.local.animals.v1"

export const LOCAL_INTERESTS_STORAGE_KEY = "saal.local.interests.v1"

/** Resolve o `localStorage` do navegador de forma preguiçosa (o ambiente de
 * testes injeta um Storage próprio). */

export function browserStorage(): Storage {
  const candidate = (globalThis as { localStorage?: Storage }).localStorage

  if (!candidate) {
    throw new Error("localStorage indisponível neste ambiente.")
  }

  return candidate
}

function parseAnimal(value: unknown): Animal | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>

  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    (record.species !== "dog" && record.species !== "cat") ||
    typeof record.age !== "string" ||
    (record.size !== "pequeno" &&
      record.size !== "médio" &&
      record.size !== "grande") ||
    (record.sex !== "macho" && record.sex !== "fêmea") ||
    (record.status !== "available" && record.status !== "adopted") ||
    typeof record.description !== "string" ||
    !Array.isArray(record.personality) ||
    !record.personality.every((item) => typeof item === "string") ||
    typeof record.medicalInfo !== "string" ||
    !Array.isArray(record.images) ||
    !record.images.every((item) => typeof item === "string")
  ) {
    return null
  }

  return {
    id: record.id,

    name: record.name,

    species: record.species,

    age: record.age,

    size: record.size,

    sex: record.sex,

    status: record.status,

    description: record.description,

    personality: record.personality,

    medicalInfo: record.medicalInfo,

    images: record.images,
  }
}

function parseInterest(value: unknown): AdminAnimalInterest | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>

  if (
    typeof record.id !== "string" ||
    typeof record.animalId !== "string" ||
    typeof record.animalName !== "string" ||
    typeof record.fullName !== "string" ||
    typeof record.whatsapp !== "string" ||
    typeof record.city !== "string" ||
    typeof record.email !== "string" ||
    typeof record.createdAt !== "string"
  ) {
    return null
  }

  return {
    id: record.id,

    animalId: record.animalId,

    animalName: record.animalName,

    fullName: record.fullName,

    whatsapp: record.whatsapp,

    city: record.city,

    email: record.email,

    createdAt: record.createdAt,
  }
}

function readList<T>(
  storage: Storage,
  key: string,
  parse: (value: unknown) => T | null,
  seed: T[],
): T[] {
  let raw: string | null = null

  try {
    raw = storage.getItem(key)
  } catch {
    return seed
  }

  if (raw === null) return seed

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) return seed

    return parsed.map(parse).filter((item): item is T => item !== null)
  } catch {
    // Dados corrompidos são substituídos pelos dados de exemplo; o protótipo
    // não deve ficar inutilizável por causa de um registro inválido.
    return seed
  }
}

function writeList(storage: Storage, key: string, values: unknown[]): void {
  storage.setItem(key, JSON.stringify(values))
}

/** Catálogo local: semeia os dados de exemplo no primeiro acesso. */

export function loadLocalAnimals(storage: Storage): Animal[] {
  return readList(storage, LOCAL_ANIMALS_STORAGE_KEY, parseAnimal, mockAnimals)
}

export function saveLocalAnimals(storage: Storage, animals: Animal[]): void {
  writeList(storage, LOCAL_ANIMALS_STORAGE_KEY, animals)
}

/** Interessados locais (contêm dados pessoais; só este navegador os guarda). */

export function loadLocalInterests(storage: Storage): AdminAnimalInterest[] {
  return readList(storage, LOCAL_INTERESTS_STORAGE_KEY, parseInterest, [])
}

export function saveLocalInterests(
  storage: Storage,

  interests: AdminAnimalInterest[],
): void {
  writeList(storage, LOCAL_INTERESTS_STORAGE_KEY, interests)
}

/** Gera o próximo id numérico sequencial a partir dos registros existentes. */

export function nextLocalId(existingIds: readonly string[]): string {
  const max = existingIds.reduce((current, id) => {
    const numeric = Number.parseInt(id, 10)

    return Number.isInteger(numeric) && numeric > current ? numeric : current
  }, 0)

  return String(max + 1)
}
