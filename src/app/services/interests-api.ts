import type {
  AdminAnimalInterest,
  AnimalInterestInput,
  AnimalInterestReceipt,
} from "../data/interests"

const publicAnimalsPath = "/api/v1/animals"

const adminInterestsPath = "/api/v1/admin/interests"

export class InterestApiError extends Error {
  constructor(readonly status: number) {
    super(`A API de interesses respondeu com HTTP ${status}.`)

    this.name = "InterestApiError"
  }
}

async function requestJson(
  path: string,
  init: RequestInit,
  credentials: RequestCredentials = "include",
): Promise<unknown> {
  const headers = new Headers(init.headers)

  headers.set("Accept", "application/json")

  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(path, {
    ...init,

    credentials,

    headers,
  })

  if (!response.ok) {
    throw new InterestApiError(response.status)
  }

  return response.json()
}

/** Envio publico: nao exige login e nao envia token CSRF (rota publica). */
export async function submitAnimalInterest(
  animalId: string,

  input: AnimalInterestInput,
): Promise<AnimalInterestReceipt> {
  const payload = await requestJson(
    `${publicAnimalsPath}/${encodeURIComponent(animalId)}/interests`,

    {
      method: "POST",

      body: JSON.stringify({
        fullName: input.fullName.trim(),

        whatsapp: input.whatsapp.trim(),

        city: input.city.trim(),

        email: input.email.trim(),
      }),
    },
    "omit",
  )

  return parseReceipt(payload)
}

/** Consulta administrativa de todos os interessados (mais recentes primeiro). */
export async function listAdminInterests(): Promise<AdminAnimalInterest[]> {
  const payload = await requestJson(adminInterestsPath, { method: "GET" })

  return parseInterestList(payload)
}

/** Consulta administrativa dos interessados de um animal especifico. */
export async function listAdminInterestsByAnimal(
  animalId: string,
): Promise<AdminAnimalInterest[]> {
  const payload = await requestJson(
    `/api/v1/admin/animals/${encodeURIComponent(animalId)}/interests`,

    { method: "GET" },
  )

  return parseInterestList(payload)
}

function parseReceipt(value: unknown): AnimalInterestReceipt {
  if (typeof value !== "object" || value === null) {
    throw new Error("Resposta inválida da API de interesses.")
  }

  const record = value as Record<string, unknown>

  if (typeof record.received !== "boolean") {
    throw new Error("Resposta inválida da API de interesses.")
  }

  return {
    received: record.received,

    createdAt: typeof record.createdAt === "string" ? record.createdAt : null,
  }
}

function parseInterestList(value: unknown): AdminAnimalInterest[] {
  if (!Array.isArray(value)) {
    throw new Error("Resposta inválida da API de interesses.")
  }

  return value.map(parseInterest)
}

function parseInterest(value: unknown): AdminAnimalInterest {
  if (typeof value !== "object" || value === null) {
    throw new Error("Resposta inválida da API de interesses.")
  }

  const record = value as Record<string, unknown>

  return {
    id: requireString(record.id),

    animalId: requireString(record.animalId),

    animalName: requireString(record.animalName),

    fullName: requireString(record.fullName),

    whatsapp: requireString(record.whatsapp),

    city: requireString(record.city),

    email: requireString(record.email),

    createdAt: requireString(record.createdAt),
  }
}

function requireString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Campo textual inválido na resposta da API de interesses.")
  }

  return value
}
