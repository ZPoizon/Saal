import {
  type AdoptionRecord,
  type ConfirmAdoptionInput,
  type RegularizeLegacyAdoptionInput,
  type ReverseAdoptionInput,
} from "../data/animals"
import {
  adoptionDateToIso,
  hasFieldErrors,
  validateConfirmAdoptionInput,
  validateRegularizeLegacyAdoptionInput,
  validateReversalInput,
} from "../data/adoption-validation"
import { AnimalApiError } from "./animals-api"
import { DatabasePublic } from "../types/supabase"
import { supabase } from "../lib/supabase"

import {
  classifyFailure,
  isNetworkFailure,
  isPostgrestFailure,
} from "./supabase-errors"

type AdoptionRow = DatabasePublic["Tables"]["adoptions"]["Row"]

/** Erro do fluxo de adoção, com a mesma classificação usada no catálogo. */
export class AdoptionApiError extends AnimalApiError {
  constructor(
    status: number,
    options: ConstructorParameters<typeof AnimalApiError>[1] = {},
  ) {
    super(status, options)
    this.name = "AdoptionApiError"
  }
}

function toAdoptionApiError(
  error: unknown,
  fallbackStatus: number,
): AdoptionApiError {
  if (error instanceof AdoptionApiError) return error

  if (isNetworkFailure(error)) {
    return new AdoptionApiError(0, {
      kind: "network",
      message: "Falha de rede ao contatar o Supabase.",
    })
  }

  if (isPostgrestFailure(error)) {
    const { kind, status } = classifyFailure(error.code)

    return new AdoptionApiError(status ?? fallbackStatus, {
      code: error.code ?? undefined,
      kind,
      message: error.message,
    })
  }

  return new AdoptionApiError(fallbackStatus, {
    kind: "unknown",
    message: error instanceof Error ? error.message : undefined,
  })
}

export function rowToAdoption(row: AdoptionRow): AdoptionRecord {
  return {
    id: row.id,
    animalId: row.animal_id,
    animalName: row.animal_name,
    animalSpecies: row.animal_species,
    animalSex: row.animal_sex,
    animalSize: row.animal_size,
    animalAge: row.animal_age,
    animalDescription: row.animal_description,
    animalMedicalInfo: row.animal_medical_info,
    animalPersonality: row.animal_personality ?? null,
    interestId: row.interest_id,
    origin: row.origin,
    adopterName: row.adopter_name,
    adopterPhone: row.adopter_phone,
    adopterEmail: row.adopter_email,
    adoptionDate: row.adoption_date,
    notes: row.notes,
    confirmedBy: row.confirmed_by,
    confirmedAt: row.confirmed_at,
    createdAt: row.created_at,
    reversedAt: row.reversed_at,
    reversedBy: row.reversed_by,
    reversalReason: row.reversal_reason,
    cleanupStatus: row.cleanup_status,
    cleanupError: row.cleanup_error,
    cleanupAttemptedAt: row.cleanup_attempted_at,
    cleanupCompletedAt: row.cleanup_completed_at,
  }
}

/** Normaliza o retorno de RPC que devolve uma única linha. */
function singleAdoption(data: unknown): AdoptionRecord {
  const row = Array.isArray(data) ? data[0] : data

  if (!row || typeof row !== "object") {
    throw new AdoptionApiError(500, {
      kind: "server",
      message: "O banco não confirmou a operação de adoção.",
    })
  }

  return rowToAdoption(row as AdoptionRow)
}

function validateOrThrow(errors: object): void {
  if (!hasFieldErrors(errors)) return

  const first = Object.values(errors).find(
    (message): message is string => typeof message === "string",
  )

  throw new AdoptionApiError(400, {
    kind: "unknown",
    message: first ?? "Revise os dados informados.",
  })
}

/** Histórico completo de adoções, mais recentes primeiro. */
export async function listAdoptions(): Promise<AdoptionRecord[]> {
  const { data, error } = await supabase
    .from("adoptions")
    .select("*")
    .order("confirmed_at", { ascending: false })

  if (error) {
    throw toAdoptionApiError(error, 0)
  }

  return (data ?? []).map(rowToAdoption)
}

/** Adoções de um animal específico, mais recentes primeiro. */
export async function listAdoptionsByAnimal(
  animalId: string,
): Promise<AdoptionRecord[]> {
  const { data, error } = await supabase
    .from("adoptions")
    .select("*")
    .eq("animal_id", animalId)
    .order("confirmed_at", { ascending: false })

  if (error) {
    throw toAdoptionApiError(error, 0)
  }

  return (data ?? []).map(rowToAdoption)
}

/**
 * Confirma a adoção em uma única operação no banco: registra o histórico,
 * define o status e grava a data real em `animals.adopted_at`.
 */
export async function confirmAdoption(
  input: ConfirmAdoptionInput,
): Promise<AdoptionRecord> {
  validateOrThrow(validateConfirmAdoptionInput(input))

  const { data, error } = await supabase.rpc("confirm_adoption", {
    p_animal_id: input.animalId,
    p_interest_id: input.interestId,
    p_origin: input.origin,
    p_adopter_name: input.adopterName.trim(),
    p_adopter_phone: input.adopterPhone?.trim() || null,
    p_adopter_email: input.adopterEmail?.trim() || null,
    p_adoption_date: adoptionDateToIso(input.adoptionDate),
    p_notes: input.notes?.trim() || null,
  })

  if (error) {
    throw toAdoptionApiError(error, 0)
  }

  return singleAdoption(data)
}

/** Reverte uma adoção confirmada, mantendo o registro no histórico. */
export async function reverseAdoption(
  input: ReverseAdoptionInput,
): Promise<AdoptionRecord> {
  validateOrThrow(validateReversalInput(input.reason, input.targetStatus))

  const { data, error } = await supabase.rpc("reverse_adoption", {
    p_adoption_id: input.adoptionId,
    p_reason: input.reason.trim(),
    p_target_status: input.targetStatus,
  })

  if (error) {
    throw toAdoptionApiError(error, 0)
  }

  return singleAdoption(data)
}

/** Regulariza a data de uma adoção legada sem inventar informações. */
export async function regularizeLegacyAdoption(
  input: RegularizeLegacyAdoptionInput,
): Promise<AdoptionRecord> {
  validateOrThrow(
    validateRegularizeLegacyAdoptionInput({
      animalId: input.animalId,
      adopterName: input.adopterName,
      adoptionDate: input.adoptionDate,
      notes: input.notes,
    }),
  )

  const { data, error } = await supabase.rpc("regularize_legacy_adoption", {
    p_animal_id: input.animalId,
    p_adoption_date: adoptionDateToIso(input.adoptionDate),
    p_adopter_name: input.adopterName.trim(),
    p_notes: input.notes?.trim() || null,
  })

  if (error) {
    throw toAdoptionApiError(error, 0)
  }

  return singleAdoption(data)
}
