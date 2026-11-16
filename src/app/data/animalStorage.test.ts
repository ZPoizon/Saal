import { describe, expect, it } from "vitest"

import { mockAnimals } from "./animals"

import { ANIMALS_STORAGE_KEY, loadAnimals, saveAnimals } from "./animalStorage"

import { getAnimalImageUrl } from "./animalImages"

class MemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  private values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

describe("animal browser storage", () => {
  it("uses the demo animals when no saved catalog exists", () => {
    expect(loadAnimals(new MemoryStorage())).toBe(mockAnimals)
  })

  it("saves and reloads the catalog", () => {
    const storage = new MemoryStorage()

    const animals = [{ ...mockAnimals[0]!, name: "Thor atualizado" }]

    saveAnimals(storage, animals)

    expect(loadAnimals(storage)).toEqual(animals)
  })

  it("rejects malformed or invalid saved data", () => {
    const storage = new MemoryStorage()

    storage.setItem(ANIMALS_STORAGE_KEY, JSON.stringify([{ id: "incompleto" }]))

    expect(() => loadAnimals(storage)).toThrow("Saved animal data is invalid.")
  })

  it("does not append image resizing parameters to uploaded data URLs", () => {
    const dataUrl = "data:image/png;base64,abc"

    expect(getAnimalImageUrl(dataUrl, "w=100&h=100")).toBe(dataUrl)
  })
})
