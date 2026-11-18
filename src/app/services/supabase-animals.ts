import type { Animal, AnimalInput, AnimalStatus } from "../data/animals"
import { AnimalApiError } from "./animals-api"

export { AnimalApiError }
import { DatabasePublic } from "../types/supabase"
import { supabase } from "../lib/supabase"

import {
  classifyFailure,
  isNetworkFailure,
  isPostgrestFailure,
  type FailureKind,
} from "./supabase-errors"

type AnimalRow = DatabasePublic["Tables"]["animals"]["Row"]
type AnimalInsert = DatabasePublic["Tables"]["animals"]["Insert"]
type AnimalUpdate = DatabasePublic["Tables"]["animals"]["Update"]

function rowToAnimal(row: AnimalRow): Animal {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    age: row.age,
    size: row.size,
    sex: row.sex,
    status: row.status,
    description: row.description,
    personality: row.personality ?? [],
    medicalInfo: row.medical_info,
    images: row.images ?? [],
  }
}

function inputToRow(
  input: AnimalInput,
  userId: string | undefined,
): AnimalInsert {
  return {
    name: input.name,
    species: input.species,
    age: input.age,
    size: input.size,
    sex: input.sex,
    status: input.status,
    description: input.description,
    personality: input.personality,
    medical_info: input.medicalInfo,
    images: input.images,
    created_by: userId,
  }
}

/**
 * Payload de atualização: apenas colunas que realmente existem na tabela
 * `animals` (migration 001). Não envia `updated_by` (coluna inexistente) e não
 * toca em `created_by`, preservando a autoria original do registro.
 */
function inputToUpdate(input: AnimalInput): AnimalUpdate {
  return {
    name: input.name,
    species: input.species,
    age: input.age,
    size: input.size,
    sex: input.sex,
    status: input.status,
    description: input.description,
    personality: input.personality,
    medical_info: input.medicalInfo,
    images: input.images,
  }
}

/**
 * Converte a falha original em `AnimalApiError`, preservando a classificação
 * real do erro do Supabase. Códigos PostgREST (ex.: `PGRST204`, `42501`) não
 * são reinterpretados como códigos HTTP numéricos.
 */
function toAnimalApiError(
  error: unknown,
  fallbackStatus: number,
): AnimalApiError {
  if (error instanceof AnimalApiError) return error

  if (isNetworkFailure(error)) {
    return new AnimalApiError(0, {
      kind: "network",
      message: "Falha de rede ao contatar o Supabase.",
    })
  }

  if (isPostgrestFailure(error)) {
    const { kind, status } = classifyFailure(error.code)

    return new AnimalApiError(status ?? fallbackStatus, {
      code: error.code ?? undefined,
      kind: kind as FailureKind,
      message: error.message,
    })
  }

  return new AnimalApiError(fallbackStatus, {
    kind: "unknown",
    message: error instanceof Error ? error.message : undefined,
  })
}

/**
 * Catálogo público: inclui animais adotados, com os disponíveis primeiro.
 * A ordenação é feita pelo banco (status ascendente, mais recentes primeiro).
 */
export async function listPublicAnimals(): Promise<Animal[]> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw toAnimalApiError(error, 0)
  }

  return (data ?? []).map(rowToAnimal)
}

/** Detalhe público: aceita qualquer estado (inclusive adotados). */
export async function getPublicAnimal(id: string): Promise<Animal> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    // `.single()` sem linhas retorna PGRST116; classificado como "not-found".
    throw toAnimalApiError(
      error ?? new Error("Resposta vazia do Supabase."),
      404,
    )
  }

  return rowToAnimal(data)
}

/** Listagem administrativa: todos os animais. */
export async function listAdminAnimals(): Promise<Animal[]> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw toAnimalApiError(error, 0)
  }

  return (data ?? []).map(rowToAnimal)
}

export async function getAdminAnimal(id: string): Promise<Animal> {
  return getPublicAnimal(id)
}

export async function createAnimal(input: AnimalInput): Promise<Animal> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("animals")
    .insert(inputToRow(input, user?.id))
    .select("*")
    .single()

  if (error || !data) {
    throw toAnimalApiError(error ?? new Error("Resposta vazia do Supabase."), 0)
  }

  return rowToAnimal(data)
}

/** Edição completa do animal pelo administrador. */
export async function updateAnimal(
  id: string,
  input: AnimalInput,
): Promise<Animal> {
  const { data, error } = await supabase
    .from("animals")
    .update(inputToUpdate(input))
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    throw toAnimalApiError(
      error ?? new Error("Resposta vazia do Supabase."),
      404,
    )
  }

  return rowToAnimal(data)
}

/**
 * Alteração dedicada de status: atualiza somente a coluna `status`, sem
 * risco de sobrescrever fotografias, descrição ou outros dados. A interface
 * só deve aplicar o novo valor após esta função confirmar a gravação.
 */
export async function updateAnimalStatus(
  id: string,
  status: AnimalStatus,
): Promise<Animal> {
  const { data, error } = await supabase
    .from("animals")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    // Zero linhas afetadas (registro inexistente ou RLS sem permissão) chega
    // como PGRST116 via `.single()`.
    throw toAnimalApiError(
      error ?? new Error("Resposta vazia do Supabase."),
      404,
    )
  }

  return rowToAnimal(data)
}

export async function deleteAnimal(id: string): Promise<void> {
  const { error } = await supabase.from("animals").delete().eq("id", id)

  if (error) {
    throw toAnimalApiError(error, 0)
  }
}
