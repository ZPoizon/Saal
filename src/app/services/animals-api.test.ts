import { afterEach, describe, expect, it, vi } from "vitest"

import type { AnimalInput } from "../data/animals"

import {
  AnimalApiError,
  createAnimal,
  getPublicAnimal,
  listAdminAnimals,
  listPublicAnimals,
  updateAnimal,
} from "./animals-api"

const csrfPayload = JSON.stringify({
  token: "csrf-synthetic",

  headerName: "X-CSRF-TOKEN",
})

const animalPayload = {
  id: "7",

  name: "Luna",

  species: "cat",

  age: "2 anos",

  size: "médio",

  sex: "fêmea",

  status: "AVAILABLE",

  description: "Gata dócil resgatada.",

  personality: ["Dócil", "Carinhosa"],

  medicalInfo: "Vacinada e castrada.",

  photos: [
    "https://exemplo.com/luna-1.jpg",

    "https://exemplo.com/luna-2.jpg",
  ],
}

const publicAnimalPayload = {
  id: "7",

  name: "Luna",

  species: "cat",

  age: "2 anos",

  size: "médio",

  sex: "fêmea",

  status: "AVAILABLE",

  description: "Gata dócil resgatada.",

  personality: ["Dócil", "Carinhosa"],

  photos: ["https://exemplo.com/luna-1.jpg", "https://exemplo.com/luna-2.jpg"],
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

afterEach(() => {
  vi.restoreAllMocks()
})

describe("animals-api service", () => {
  it("lista o catálogo público, mapeando photos para images e AVAILABLE para available", async () => {
    const fetch = vi

      .spyOn(globalThis, "fetch")

      .mockResolvedValue(
        new Response(JSON.stringify([publicAnimalPayload]), { status: 200 }),
      )

    const animals = await listPublicAnimals()

    expect(animals).toEqual([
      {
        id: "7",

        name: "Luna",

        species: "cat",

        age: "2 anos",

        size: "médio",

        sex: "fêmea",

        status: "available",

        description: "Gata dócil resgatada.",

        personality: ["Dócil", "Carinhosa"],

        medicalInfo: "",

        images: [
          "https://exemplo.com/luna-1.jpg",

          "https://exemplo.com/luna-2.jpg",
        ],
      },
    ])

    expect(fetch).toHaveBeenCalledTimes(1)

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/animals",

      expect.objectContaining({ credentials: "include", method: "GET" }),
    )
  })

  it("aceita animais adotados no detalhe público e codifica o id", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ...publicAnimalPayload, status: "ADOPTED" }),

        {
          status: 200,
        },
      ),
    )

    await expect(getPublicAnimal("a b/ç")).resolves.toEqual(
      expect.objectContaining({ status: "adopted" }),
    )

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/v1/animals/${encodeURIComponent("a b/ç")}`,

      expect.objectContaining({ method: "GET" }),
    )
  })

  it("lista todos os estados na rota administrativa", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          animalPayload,

          { ...animalPayload, id: "8", status: "ADOPTED" },
        ]),

        { status: 200 },
      ),
    )

    const animals = await listAdminAnimals()

    expect(animals.map((animal) => animal.status)).toEqual([
      "available",

      "adopted",
    ])

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/v1/admin/animals",

      expect.objectContaining({ method: "GET", credentials: "include" }),
    )
  })

  it("cria animal enviando CSRF, cookies e o corpo com photos e status em maiúsculas", async () => {
    const fetch = vi

      .spyOn(globalThis, "fetch")

      .mockResolvedValueOnce(new Response(csrfPayload, { status: 200 }))

      .mockResolvedValueOnce(
        new Response(JSON.stringify(animalPayload), { status: 201 }),
      )

    await expect(createAnimal(validInput)).resolves.toEqual(
      expect.objectContaining({ id: "7", status: "available" }),
    )

    expect(fetch).toHaveBeenCalledTimes(2)

    expect(fetch.mock.calls[0]?.[0]).toBe("/api/v1/auth/csrf")

    const [url, options] = fetch.mock.calls[1]!

    expect(url).toBe("/api/v1/admin/animals")

    expect(options?.method).toBe("POST")

    expect(options?.credentials).toBe("include")

    expect(new Headers(options?.headers).get("X-CSRF-TOKEN")).toBe(
      "csrf-synthetic",
    )

    const body = JSON.parse(String(options?.body)) as Record<string, unknown>

    expect(body.photos).toEqual(["https://exemplo.com/luna-1.jpg"])

    expect(body.status).toBe("AVAILABLE")

    expect(body).not.toHaveProperty("images")
  })

  it("atualiza animal com PUT e CSRF", async () => {
    const fetch = vi

      .spyOn(globalThis, "fetch")

      .mockResolvedValueOnce(new Response(csrfPayload, { status: 200 }))

      .mockResolvedValueOnce(
        new Response(JSON.stringify(animalPayload), { status: 200 }),
      )

    await expect(
      updateAnimal("7", { ...validInput, status: "adopted" }),
    ).resolves.toEqual(expect.objectContaining({ status: "available" }))

    const [url, options] = fetch.mock.calls[1]!

    expect(url).toBe("/api/v1/admin/animals/7")

    expect(options?.method).toBe("PUT")

    expect(new Headers(options?.headers).get("X-CSRF-TOKEN")).toBe(
      "csrf-synthetic",
    )

    expect(JSON.parse(String(options?.body)).status).toBe("ADOPTED")
  })

  it("propaga o status HTTP em AnimalApiError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 }),
    )

    await expect(getPublicAnimal("999")).rejects.toEqual(
      expect.objectContaining<Partial<AnimalApiError>>({ status: 404 }),
    )
  })

  it("falha explicitamente quando a resposta não tem o formato esperado", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ not: "an array" }), { status: 200 }),
    )

    await expect(listPublicAnimals()).rejects.toThrow("Resposta inválida")

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ id: 1 }]), { status: 200 }),
    )

    await expect(listPublicAnimals()).rejects.toThrow("Campo textual inválido")
  })
})
