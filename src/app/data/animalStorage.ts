import { Animal, mockAnimals } from "./animals"

export const ANIMALS_STORAGE_KEY = "saal.animals.v1"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isAnimal(value: unknown): value is Animal {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.species === "dog" || value.species === "cat") &&
    typeof value.age === "string" &&
    (value.size === "pequeno" ||
      value.size === "médio" ||
      value.size === "grande") &&
    (value.sex === "macho" || value.sex === "fêmea") &&
    (value.status === "available" ||
      value.status === "treatment" ||
      value.status === "adopted") &&
    typeof value.description === "string" &&
    Array.isArray(value.personality) &&
    value.personality.every((trait) => typeof trait === "string") &&
    typeof value.medicalInfo === "string" &&
    Array.isArray(value.images) &&
    value.images.every((image) => typeof image === "string")
  )
}

export function loadAnimals(storage: Pick<Storage, "getItem">): Animal[] {
  const savedAnimals = storage.getItem(ANIMALS_STORAGE_KEY)

  if (savedAnimals === null) return mockAnimals

  const parsedAnimals: unknown = JSON.parse(savedAnimals)

  if (!Array.isArray(parsedAnimals) || !parsedAnimals.every(isAnimal)) {
    throw new Error("Saved animal data is invalid.")
  }

  return parsedAnimals
}

export function saveAnimals(
  storage: Pick<Storage, "setItem">,

  animals: Animal[],
): void {
  storage.setItem(ANIMALS_STORAGE_KEY, JSON.stringify(animals))
}
