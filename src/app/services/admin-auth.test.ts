import { afterEach, describe, expect, it, vi } from "vitest"

import {
  AdminAuthError,
  getAdminAuthErrorMessage,
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

  it("trata 401/403 na consulta de sessão como visitante não autenticado", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    )

    await expect(getAdminSession()).resolves.toBe(false)
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
      expect.objectContaining<Partial<AdminAuthError>>({
        status: 429,
        failure: "rate-limited",
      }),
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

    await expect(getAdminSession()).rejects.toEqual(
      expect.objectContaining<Partial<AdminAuthError>>({
        failure: "invalid-response",
      }),
    )
  })

  it("classifica falha de rede sem confundir com credencial inválida", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    )

    await expect(getAdminSession()).rejects.toEqual(
      expect.objectContaining<Partial<AdminAuthError>>({
        status: 0,
        failure: "network",
      }),
    )

    const loginError = await loginAdmin(
      "synthetic-admin",
      "synthetic-password",
    ).catch((error: unknown) => error)

    expect(loginError).toBeInstanceOf(AdminAuthError)

    expect(getAdminAuthErrorMessage(loginError, "login")).toContain(
      "conectar ao servidor",
    )
  })

  it("explica 404 como API ausente ou proxy /api não configurado", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 }),
    )

    const sessionError = await getAdminSession().catch(
      (error: unknown) => error,
    )

    expect(sessionError).toBeInstanceOf(AdminAuthError)

    expect(getAdminAuthErrorMessage(sessionError, "session")).toContain(
      "proxy /api",
    )
  })

  it("explica credencial inválida, 5xx e resposta não JSON com mensagens distintas", () => {
    expect(getAdminAuthErrorMessage(new AdminAuthError(401), "login")).toBe(
      "Usuário ou senha inválidos.",
    )

    expect(
      getAdminAuthErrorMessage(new AdminAuthError(503), "login"),
    ).toContain("temporariamente indisponível")

    expect(
      getAdminAuthErrorMessage(
        new AdminAuthError(200, "invalid-response"),
        "session",
      ),
    ).toContain("formato inesperado")
  })
})
