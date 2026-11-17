import { beforeEach, describe, expect, it } from "vitest"

import { LOCAL_ANIMALS_STORAGE_KEY } from "../data/local-store"

import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
  requestCsrfToken,
} from "./admin-auth"

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

let session: MemoryStorage

beforeEach(() => {
  session = new MemoryStorage()
})

describe("admin-auth service (modo local)", () => {
  it("começa sem sessão administrativa", async () => {
    await expect(getAdminSession(session)).resolves.toBe(false)
  })

  it("rejeita credencial inválida sem criar sessão", async () => {
    await expect(loginAdmin("admin", "errada", session)).rejects.toMatchObject({
      name: "AdminAuthError",

      status: 401,
    })

    await expect(getAdminSession(session)).resolves.toBe(false)
  })

  it("rejeita usuário inválido mesmo com a senha correta", async () => {
    await expect(
      loginAdmin("outro", "saal2026", session),
    ).rejects.toMatchObject({ status: 401 })
  })

  it("aceita a credencial do protótipo e cria a sessão local", async () => {
    await loginAdmin("admin", "saal2026", session)

    await expect(getAdminSession(session)).resolves.toBe(true)
  })

  it("logout encerra a sessão local", async () => {
    await loginAdmin("admin", "saal2026", session)

    await logoutAdmin(session)

    await expect(getAdminSession(session)).resolves.toBe(false)
  })

  it("fornece token CSRF constante no modo local", async () => {
    await expect(requestCsrfToken()).resolves.toBe("local-mode")
  })

  it("não usa o armazenamento de dados do catálogo", async () => {
    await loginAdmin("admin", "saal2026", session)

    expect(session.getItem(LOCAL_ANIMALS_STORAGE_KEY)).toBeNull()
  })
})
