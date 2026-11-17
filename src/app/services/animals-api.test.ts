import { beforeEach, describe, expect, it } from "vitest"

import type { AnimalInput } from "../data/animals"

import { LOCAL_ANIMALS_STORAGE_KEY } from "../data/local-store"

import {
  AnimalApiError,
  createAnimal,
  getAdminAnimal,
  getPublicAnimal,
  listAdminAnimals,
  listPublicAnimals,
  updateAnimal,
  deleteAnimal,
} from "./animals-api"

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length(): number {
    return this.values.size
  }

  clear(): void {
    this.values.clear()
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

const validInput: AnimalInput = {
  name: "Luna",

  species: "cat",

  age: "2 anos",

  size: "médio",

  sex: "fêmea",

  status: "available",

  description: "Gata dócil resgatada.",

  personality: ["Dócil", "Carinhosa"],

  medicalInfo: "Vacinada e castrada.",

  images: ["https://exemplo.com/luna-1.jpg"],
}

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
})

describe("animals-api service (modo local)", () => {
  it("semeia os dados de exemplo e lista só os disponíveis no catálogo público", async () => {
    const animals = await listPublicAnimals(storage)

    expect(animals.length).toBeGreaterThan(0)

    expect(animals.every((animal) => animal.status === "available")).toBe(true)
  })

  it("lista disponíveis e adotados na listagem administrativa", async () => {
    const animals = await listAdminAnimals(storage)

    expect(animals.some((animal) => animal.status === "available")).toBe(true)

    expect(animals.some((animal) => animal.status === "adopted")).toBe(true)
  })

  it("encontra animal pelo id no detalhe público", async () => {
    await expect(getPublicAnimal("7", storage)).resolves.toMatchObject({
      name: "Rex",

      status: "adopted",
    })
  })

  it("rejeita com 404 quando o id não existe", async () => {
    await expect(getPublicAnimal("inexistente", storage)).rejects.toEqual(
      expect.objectContaining<Partial<AnimalApiError>>({ status: 404 }),
    )
  })

  it("cria animal com id sequencial e persiste no armazenamento", async () => {
    const created = await createAnimal(validInput, storage)

    expect(created.id).toBe("9")

    const persisted = JSON.parse(
      storage.getItem(LOCAL_ANIMALS_STORAGE_KEY) as string,
    ) as unknown[]

    expect(persisted).toHaveLength(9)

    await expect(getAdminAnimal(created.id, storage)).resolves.toMatchObject({
      name: "Luna",
    })
  })

  it("atualiza animal existente e mantém o id", async () => {
    const updated = await updateAnimal(
      "1",

      { ...validInput, name: "Thor Atualizado", status: "adopted" },

      storage,
    )

    expect(updated).toMatchObject({ id: "1", name: "Thor Atualizado" })

    const animals = await listAdminAnimals(storage)

    expect(animals.find((animal) => animal.id === "1")?.status).toBe("adopted")
  })

  it("rejeita com 404 ao atualizar animal inexistente", async () => {
    await expect(updateAnimal("999", validInput, storage)).rejects.toEqual(
      expect.objectContaining<Partial<AnimalApiError>>({ status: 404 }),
    )
  })

  it("exclui animal existente do armazenamento", async () => {
    await expect(deleteAnimal("7", storage)).resolves.toBeUndefined()

    const persisted = JSON.parse(
      storage.getItem(LOCAL_ANIMALS_STORAGE_KEY) as string,
    ) as unknown[]

    expect(persisted).toHaveLength(7)

    await expect(getAdminAnimal("7", storage)).rejects.toEqual(
      expect.objectContaining<Partial<AnimalApiError>>({ status: 404 }),
    )
  })

  it("rejeita com 404 ao excluir animal inexistente", async () => {
    await expect(deleteAnimal("999", storage)).rejects.toEqual(
      expect.objectContaining<Partial<AnimalApiError>>({ status: 404 }),
    )
  })
})
