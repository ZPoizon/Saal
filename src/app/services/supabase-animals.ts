import type {
  Animal,
  AnimalInput,
} from "../data/animals"
import { AnimalApiError } from "./animals-api"

export { AnimalApiError }
import { DatabasePublic } from "../types/supabase"
import { supabase } from "../lib/supabase"

type AnimalRow = DatabasePublic["Tables"]["animals"]["Row"]
type AnimalInsert = DatabasePublic["Tables"]["animals"]["Insert"]

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

/** Lista pública: apenas animais disponíveis. */
export async function listPublicAnimals(): Promise<Animal[]> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false })

  if (error) {
    throw new AnimalApiError(error.code ? parseInt(error.code, 10) || 0 : 0)
  }

  return (data ?? []).map(rowToAnimal)
}

/** Detalhe público: aceita qualquer estado. */
export async function getPublicAnimal(id: string): Promise<Animal> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    throw new AnimalApiError(error?.code ? parseInt(error.code, 10) || 404 : 404)
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
    throw new AnimalApiError(error.code ? parseInt(error.code, 10) || 0 : 0)
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
    throw new AnimalApiError(error?.code ? parseInt(error.code, 10) || 0 : 0)
  }

  return rowToAnimal(data)
}

export async function updateAnimal(
  id: string,
  input: AnimalInput,
): Promise<Animal> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("animals")
    .update({
      ...inputToRow(input, user?.id),
      updated_by: user?.id,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    throw new AnimalApiError(error?.code ? parseInt(error.code, 10) || 404 : 404)
  }

  return rowToAnimal(data)
}

export async function deleteAnimal(id: string): Promise<void> {
  const { error } = await supabase.from("animals").delete().eq("id", id)

  if (error) {
    throw new AnimalApiError(error.code ? parseInt(error.code, 10) || 0 : 0)
  }
}
