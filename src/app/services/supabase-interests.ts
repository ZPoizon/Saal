import type {
  AdminAnimalInterest,
  AnimalInterestInput,
  AnimalInterestReceipt,
} from "../data/interests"
import { InterestApiError } from "./interests-api"

export { InterestApiError }
import { DatabasePublic } from "../types/supabase"
import { supabase } from "../lib/supabase"

type InterestRow = DatabasePublic["Tables"]["interests"]["Row"]
type InterestInsert = DatabasePublic["Tables"]["interests"]["Insert"]

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
  // Verifica se o animal existe
  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, status")
    .eq("id", animalId)
    .single()

  if (animalError || !animal) {
    throw new InterestApiError(404)
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
    throw new InterestApiError(error?.code ? parseInt(error.code, 10) || 0 : 0)
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
    throw new InterestApiError(error?.code ? parseInt(error.code, 10) || 0 : 0)
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
    throw new InterestApiError(error?.code ? parseInt(error.code, 10) || 0 : 0)
  }

  return (data ?? []).map(rowToInterest)
}
