import { beforeEach, describe, expect, it } from "vitest"

import type { AnimalInterestInput } from "../data/interests"

import { LOCAL_INTERESTS_STORAGE_KEY } from "../data/local-store"

import {
  InterestApiError,
  listAdminInterests,
  listAdminInterestsByAnimal,
  submitAnimalInterest,
} from "./interests-api"

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

const validInput: AnimalInterestInput = {
  fullName: "Maria Silva",

  whatsapp: "15 99663-1983",

  city: "Capão Bonito",

  email: "maria@example.org",
}

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
})

describe("interests-api service (modo local)", () => {
  it("registra a manifestação com nome do animal e devolve recibo", async () => {
    const receipt = await submitAnimalInterest("1", validInput, storage)

    expect(receipt).toMatchObject({ received: true })

    expect(typeof receipt.createdAt).toBe("string")

    const persisted = JSON.parse(
      storage.getItem(LOCAL_INTERESTS_STORAGE_KEY) as string,
    ) as Array<Record<string, unknown>>

    expect(persisted).toHaveLength(1)

    expect(persisted[0]).toMatchObject({
      animalId: "1",

      animalName: "Thor",

      fullName: "Maria Silva",

      email: "maria@example.org",
    })
  })

  it("lista os interessados mais recentes primeiro", async () => {
    await submitAnimalInterest("1", validInput, storage)

    await submitAnimalInterest(
      "2",
      { ...validInput, fullName: "João Souza" },
      storage,
    )

    const interests = await listAdminInterests(storage)

    expect(interests.map((interest) => interest.animalName)).toEqual([
      "Luna",

      "Thor",
    ])
  })

  it("filtra interessados por animal na consulta administrativa", async () => {
    await submitAnimalInterest("1", validInput, storage)

    await submitAnimalInterest("2", validInput, storage)

    const byAnimal = await listAdminInterestsByAnimal("1", storage)

    expect(byAnimal).toHaveLength(1)

    expect(byAnimal[0]).toMatchObject({ animalId: "1" })
  })

  it("rejeita com 404 quando o animal não existe", async () => {
    await expect(
      submitAnimalInterest("999", validInput, storage),
    ).rejects.toEqual(
      expect.objectContaining<Partial<InterestApiError>>({ status: 404 }),
    )
  })

  it("não vaza dados pessoais quando não há registros", async () => {
    await expect(listAdminInterests(storage)).resolves.toEqual([])
  })
})
