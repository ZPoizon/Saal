import { afterEach, describe, expect, it, vi } from "vitest"

import {
  AdminAuthError,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "./admin-auth"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("admin-auth service", () => {
  it("consulta o estado de sessão no servidor com cookies", async () => {
    const fetch = vi

      .spyOn(globalThis, "fetch")

      .mockResolvedValue(
        new Response(JSON.stringify({ authenticated: true }), { status: 200 }),
      )

    await expect(getAdminSession()).resolves.toBe(true)

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/session",

      expect.objectContaining({ credentials: "include" }),
    )
  })

  it("envia credenciais apenas no corpo e inclui o token CSRF", async () => {
    const fetch = vi

      .spyOn(globalThis, "fetch")

      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: "csrf-synthetic",

            headerName: "X-CSRF-TOKEN",
          }),

          { status: 200 },
        ),
      )

      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(
      loginAdmin("synthetic-admin", "synthetic-password"),
    ).resolves.toBeUndefined()

    const [url, options] = fetch.mock.calls[1]!

    expect(url).toBe("/api/v1/auth/login")

    expect(options?.credentials).toBe("include")

    expect(new Headers(options?.headers).get("X-CSRF-TOKEN")).toBe(
      "csrf-synthetic",
    )

    expect(String(options?.body)).toContain("username=synthetic-admin")

    expect(String(options?.body)).toContain("password=synthetic-password")

    expect(String(url)).not.toContain("synthetic-password")
  })

  it("propaga a limitação de tentativas sem resposta de sucesso", async () => {
    vi.spyOn(globalThis, "fetch")

      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: "csrf-synthetic",

            headerName: "X-CSRF-TOKEN",
          }),

          { status: 200 },
        ),
      )

      .mockResolvedValueOnce(new Response(null, { status: 429 }))

    await expect(
      loginAdmin("synthetic-admin", "synthetic-password"),
    ).rejects.toEqual(
      expect.objectContaining<Partial<AdminAuthError>>({ status: 429 }),
    )
  })

  it("encerra a sessão no servidor com CSRF e cookies", async () => {
    const fetch = vi

      .spyOn(globalThis, "fetch")

      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: "csrf-synthetic",

            headerName: "X-CSRF-TOKEN",
          }),

          { status: 200 },
        ),
      )

      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(logoutAdmin()).resolves.toBeUndefined()

    const [url, options] = fetch.mock.calls[1]!

    expect(url).toBe("/api/v1/auth/logout")

    expect(options?.method).toBe("POST")

    expect(options?.credentials).toBe("include")

    expect(new Headers(options?.headers).get("X-CSRF-TOKEN")).toBe(
      "csrf-synthetic",
    )
  })

  it("falha explicitamente quando o backend retorna um estado inválido", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ authenticated: "yes" }), { status: 200 }),
    )

    await expect(getAdminSession()).rejects.toThrow("Resposta inválida")
  })
})
