import type {
  AdminAnimalInterest,
  AnimalInterestInput,
  AnimalInterestReceipt,
} from "../data/interests"
import { InterestApiError } from "./interests-api"

export { InterestApiError }
import { DatabasePublic } from "../types/supabase"
import { supabase } from "../lib/supabase"

import {
  classifyFailure,
  isNetworkFailure,
  isPostgrestFailure,
} from "./supabase-errors"

type InterestRow = DatabasePublic["Tables"]["interests"]["Row"]
type InterestInsert = DatabasePublic["Tables"]["interests"]["Insert"]

function toInterestApiError(
  error: unknown,
  fallbackStatus: number,
): InterestApiError {
  if (error instanceof InterestApiError) return error

  if (isNetworkFailure(error)) {
    return new InterestApiError(0, {
      kind: "network",
      message: "Falha de rede ao contatar o Supabase.",
    })
  }

  if (isPostgrestFailure(error)) {
    const { kind, status } = classifyFailure(error.code)

    return new InterestApiError(status ?? fallbackStatus, {
      code: error.code ?? undefined,
      kind,
      message: error.message,
    })
  }

  return new InterestApiError(fallbackStatus, {
    kind: "unknown",
    message: error instanceof Error ? error.message : undefined,
  })
}

function rowToInterest(row: InterestRow): AdminAnimalInterest {
  return {
    id: row.id,
    animalId: row.animal_id,
    animalName: row.animal_name,
    fullName: row.full_name,
    whatsapp: row.whatsapp,
    city: row.city,
    email: row.email,
    createdAt: row.created_at,
  }
}

function inputToRow(
  animalId: string,
  animalName: string,
  input: AnimalInterestInput,
): InterestInsert {
  return {
    animal_id: animalId,
    animal_name: animalName,
    full_name: input.fullName.trim(),
    whatsapp: input.whatsapp.trim(),
    city: input.city.trim(),
    email: input.email.trim(),
  }
}

/** Envio público: grava a manifestação de interesse no banco. */
export async function submitAnimalInterest(
  animalId: string,
  input: AnimalInterestInput,
): Promise<AnimalInterestReceipt> {
  // Verifica se o animal existe. maybeSingle evita HTTP 406 (PGRST116) para
  // identificadores inexistentes: a ausência é tratada explicitamente como 404.
  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, status")
    .eq("id", animalId)
    .maybeSingle()

  if (animalError) {
    throw toInterestApiError(animalError, 0)
  }

  if (!animal) {
    throw new InterestApiError(404, {
      kind: "not-found",
      message: "Animal não encontrado.",
    })
  }

  if (animal.status !== "available") {
    throw new InterestApiError(409)
  }

  const { data, error } = await supabase
    .from("interests")
    .insert(inputToRow(animalId, animal.name, input))
    .select("*")
    .single()

  if (error || !data) {
    // Guarda no banco (migration 002): violação de CHECK do trigger significa
    // animal indisponível (409). FK violation: animal inexistente (404).
    if (error?.code === "23514") {
      throw new InterestApiError(409, {
        code: error.code,
        kind: "unknown",
        message: error.message,
      })
    }

    if (error?.code === "23503") {
      throw new InterestApiError(404, {
        code: error.code,
        kind: "not-found",
        message: error.message,
      })
    }

    throw toInterestApiError(
      error ?? new Error("Resposta vazia do Supabase."),
      0,
    )
  }

  return {
    received: true,
    createdAt: data.created_at,
  }
}

/** Consulta administrativa: todos os interessados, mais recentes primeiro. */
export async function listAdminInterests(): Promise<AdminAnimalInterest[]> {
  const { data, error } = await supabase
    .from("interests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw toInterestApiError(error, 0)
  }

  return (data ?? []).map(rowToInterest)
}

/** Consulta administrativa dos interessados de um animal específico. */
export async function listAdminInterestsByAnimal(
  animalId: string,
): Promise<AdminAnimalInterest[]> {
  const { data, error } = await supabase
    .from("interests")
    .select("*")
    .eq("animal_id", animalId)
    .order("created_at", { ascending: false })

  if (error) {
    throw toInterestApiError(error, 0)
  }

  return (data ?? []).map(rowToInterest)
}
