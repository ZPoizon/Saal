import { afterEach, describe, expect, it, vi } from "vitest"

import {
  InterestApiError,
  listAdminInterests,
  listAdminInterestsByAnimal,
  submitAnimalInterest,
} from "./interests-api"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("interests-api service", () => {
  it("sends a public interest without cookies or exposing submitted data in its receipt", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ received: true, createdAt: "2026-11-16T12:00:00" }),

        {
          status: 201,
        },
      ),
    )

    const receipt = await submitAnimalInterest("7/1", {
      fullName: "Maria Silva",

      whatsapp: "(11) 99999-9999",

      city: "São Paulo",

      email: "maria@example.com",
    })

    expect(receipt).toEqual({
      received: true,

      createdAt: "2026-11-16T12:00:00",
    })

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/animals/7%2F1/interests",

      expect.objectContaining({ method: "POST", credentials: "omit" }),
    )

    const [, options] = fetch.mock.calls[0]!

    expect(JSON.parse(String(options?.body))).toEqual({
      fullName: "Maria Silva",

      whatsapp: "(11) 99999-9999",

      city: "São Paulo",

      email: "maria@example.com",
    })
  })

  it("fails explicitly when the API does not confirm registration", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 409 }),
    )

    await expect(
      submitAnimalInterest("7", {
        fullName: "Maria Silva",

        whatsapp: "(11) 99999-9999",

        city: "São Paulo",

        email: "maria@example.com",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<InterestApiError>>({ status: 409 }),
    )
  })

  it("loads administrative personal data only from the admin API routes", async () => {
    const payload = [
      {
        id: "1",

        animalId: "7",

        animalName: "Luna",

        fullName: "Maria Silva",

        whatsapp: "(11) 99999-9999",

        city: "São Paulo",

        email: "maria@example.com",

        createdAt: "2026-11-16T12:00:00",
      },
    ]

    const fetch = vi

      .spyOn(globalThis, "fetch")

      .mockResolvedValueOnce(
        new Response(JSON.stringify(payload), { status: 200 }),
      )

      .mockResolvedValueOnce(
        new Response(JSON.stringify(payload), { status: 200 }),
      )

    await expect(listAdminInterests()).resolves.toEqual(payload)

    await expect(listAdminInterestsByAnimal("7")).resolves.toEqual(payload)

    expect(fetch.mock.calls[0]?.[0]).toBe("/api/v1/admin/interests")

    expect(fetch.mock.calls[1]?.[0]).toBe("/api/v1/admin/animals/7/interests")

    expect(fetch.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ credentials: "include", method: "GET" }),
    )
  })
})
