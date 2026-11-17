import type {
  Animal,
  AnimalInput,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalStatus,
} from "../data/animals"

import { csrfHeaderName, requestCsrfToken } from "./admin-auth"

const publicAnimalsPath = "/api/v1/animals"

const adminAnimalsPath = "/api/v1/admin/animals"

export class AnimalApiError extends Error {
  constructor(readonly status: number) {
    super(`A API de animais respondeu com HTTP ${status}.`)

    this.name = "AnimalApiError"
  }
}

interface RequestOptions {
  /** Requisições de mutação precisam do token CSRF da sessão administrativa. */

  csrf?: boolean
}

async function request(
  path: string,

  init: RequestInit,

  options: RequestOptions = {},
): Promise<Response> {
  const headers = new Headers(init.headers)

  headers.set("Accept", "application/json")

  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  if (options.csrf) {
    headers.set(csrfHeaderName, await requestCsrfToken())
  }

  const response = await fetch(path, {
    ...init,

    credentials: "include",

    headers,
  })

  if (!response.ok) {
    throw new AnimalApiError(response.status)
  }

  return response
}

async function requestJson(
  path: string,

  init: RequestInit,

  options: RequestOptions = {},
): Promise<unknown> {
  const response = await request(path, init, options)

  return response.json()
}

/** Catalogo publico: somente animais disponiveis. */

export async function listPublicAnimals(): Promise<Animal[]> {
  const payload = await requestJson(publicAnimalsPath, { method: "GET" })

  return parseAnimalList(payload)
}

/** Detalhe publico: aceita qualquer estado aprovado (inclusive adotados). */

export async function getPublicAnimal(id: string): Promise<Animal> {
  const payload = await requestJson(
    `${publicAnimalsPath}/${encodeURIComponent(id)}`,

    { method: "GET" },
  )

  return parseAnimal(payload)
}

/** Listagem administrativa: inclui animais disponiveis e adotados. */

export async function listAdminAnimals(): Promise<Animal[]> {
  const payload = await requestJson(adminAnimalsPath, { method: "GET" })

  return parseAnimalList(payload)
}

export async function getAdminAnimal(id: string): Promise<Animal> {
  const payload = await requestJson(
    `${adminAnimalsPath}/${encodeURIComponent(id)}`,

    { method: "GET" },
  )

  return parseAnimal(payload)
}

export async function createAnimal(input: AnimalInput): Promise<Animal> {
  const payload = await requestJson(
    adminAnimalsPath,

    {
      method: "POST",

      body: serializeAnimalInput(input),
    },

    { csrf: true },
  )

  return parseAnimal(payload)
}

export async function updateAnimal(
  id: string,

  input: AnimalInput,
): Promise<Animal> {
  const payload = await requestJson(
    `${adminAnimalsPath}/${encodeURIComponent(id)}`,

    {
      method: "PUT",

      body: serializeAnimalInput(input),
    },

    { csrf: true },
  )

  return parseAnimal(payload)
}

function serializeAnimalInput(input: AnimalInput): string {
  return JSON.stringify({
    name: input.name,

    species: input.species,

    age: input.age,

    size: input.size,

    sex: input.sex,

    status: input.status === "available" ? "AVAILABLE" : "ADOPTED",

    description: input.description,

    personality: input.personality,

    medicalInfo: input.medicalInfo,

    photos: input.images,
  })
}

function parseAnimalList(value: unknown): Animal[] {
  if (!Array.isArray(value)) {
    throw new Error("Resposta inválida da API de animais.")
  }

  return value.map(parseAnimal)
}

function parseAnimal(value: unknown): Animal {
  if (typeof value !== "object" || value === null) {
    throw new Error("Resposta inválida da API de animais.")
  }

  const record = value as Record<string, unknown>

  return {
    id: requireString(record.id),

    name: requireString(record.name),

    species: parseSpecies(record.species),

    age: requireString(record.age),

    size: parseSize(record.size),

    sex: parseSex(record.sex),

    status: parseStatus(record.status),

    description: requireString(record.description),

    personality: requireStringList(record.personality),

    medicalInfo:
      typeof record.medicalInfo === "string" ? record.medicalInfo : "",

    images: requireStringList(record.photos),
  }
}

function requireString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Campo textual inválido na resposta da API de animais.")
  }

  return value
}

function requireStringList(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("Lista inválida na resposta da API de animais.")
  }

  return value as string[]
}

function parseSpecies(value: unknown): AnimalSpecies {
  if (value === "dog" || value === "cat") return value

  throw new Error("Espécie inválida na resposta da API de animais.")
}

function parseSize(value: unknown): AnimalSize {
  if (value === "pequeno" || value === "médio" || value === "grande") {
    return value
  }

  throw new Error("Porte inválido na resposta da API de animais.")
}

function parseSex(value: unknown): AnimalSex {
  if (value === "macho" || value === "fêmea") return value

  throw new Error("Sexo inválido na resposta da API de animais.")
}

function parseStatus(value: unknown): AnimalStatus {
  if (value === "AVAILABLE") return "available"

  if (value === "ADOPTED") return "adopted"

  throw new Error("Status inválido na resposta da API de animais.")
}
