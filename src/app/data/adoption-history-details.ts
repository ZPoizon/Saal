import type {
  AdoptionRecord,
  Animal,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
} from "./animals"

/**
 * Dados exibidos no histórico textual de adoções.
 *
 * Este módulo é intencionalmente alheio a fotografias: o histórico preserva
 * apenas informações textuais do animal e do adotante, mesmo depois que os
 * arquivos do Storage forem removidos. Não inclua URLs, caminhos ou imagens
 * neste contrato. A personalidade entra como texto, a partir do snapshot da
 * adoção ou do cadastro atual quando o registro é legado.
 */

const SPECIES_LABELS: Record<AnimalSpecies, string> = {
  dog: "Canino",
  cat: "Felino",
}

const SEX_LABELS: Record<AnimalSex, string> = {
  macho: "Macho",
  fêmea: "Fêmea",
}

const SIZE_LABELS: Record<AnimalSize, string> = {
  pequeno: "Pequeno",
  médio: "Médio",
  grande: "Grande",
}

export interface AdoptionHistoryAnimalDetails {
  name: string
  species: string | null
  sex: string | null
  size: string | null
  age: string | null
  description: string | null
  medicalInfo: string | null
  personality: string | null
}

export interface AdoptionHistoryDetails {
  id: string
  animal: AdoptionHistoryAnimalDetails
  adoptionDate: string
  origin: string
  adopterName: string
  contacts: string[]
  notes: string | null
  confirmedAt: string
  reversedAt: string | null
  reversalReason: string | null
  isActive: boolean
}

function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()

  return trimmed ? trimmed : null
}

function speciesLabel(value: AnimalSpecies | null | undefined): string | null {
  return value ? (SPECIES_LABELS[value] ?? null) : null
}

function sexLabel(value: AnimalSex | null | undefined): string | null {
  return value ? (SEX_LABELS[value] ?? null) : null
}

function sizeLabel(value: AnimalSize | null | undefined): string | null {
  return value ? (SIZE_LABELS[value] ?? null) : null
}

function personalityText(
  value: readonly string[] | null | undefined,
): string | null {
  const traits = (value ?? [])
    .map((trait) => trait.trim())
    .filter((trait) => trait.length > 0)

  return traits.length > 0 ? traits.join(", ") : null
}

/**
 * Combina os snapshots gravados na confirmação com o cadastro atual.
 * O snapshot tem prioridade; o cadastro cobre adoções antigas sem snapshot.
 */
export function buildAdoptionHistoryDetails(
  adoption: AdoptionRecord,
  animal: Animal | null,
): AdoptionHistoryDetails {
  const contacts = [adoption.adopterPhone, adoption.adopterEmail]
    .map((value) => textOrNull(value))
    .filter((value): value is string => value !== null)

  return {
    id: adoption.id,
    animal: {
      name: adoption.animalName,
      species: speciesLabel(adoption.animalSpecies ?? animal?.species),
      sex: sexLabel(adoption.animalSex ?? animal?.sex),
      size: sizeLabel(adoption.animalSize ?? animal?.size),
      age: textOrNull(adoption.animalAge ?? animal?.age),
      description: textOrNull(
        adoption.animalDescription ?? animal?.description,
      ),
      medicalInfo: textOrNull(
        adoption.animalMedicalInfo ?? animal?.medicalInfo,
      ),
      personality: personalityText(
        adoption.animalPersonality ?? animal?.personality,
      ),
    },
    adoptionDate: adoption.adoptionDate,
    origin: adoption.origin === "site" ? "Pelo site" : "Presencial",
    adopterName: adoption.adopterName,
    contacts,
    notes: textOrNull(adoption.notes),
    confirmedAt: adoption.confirmedAt,
    reversedAt: adoption.reversedAt,
    reversalReason: textOrNull(adoption.reversalReason),
    isActive: adoption.reversedAt === null,
  }
}
