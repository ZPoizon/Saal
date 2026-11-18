import { describe, expect, it } from "vitest"

import { AnimalApiError } from "./animals-api"

import {
  classifyFailure,
  isNetworkFailure,
  isPostgrestFailure,
  kindFromStatus,
  resourceFailureMessage,
} from "./supabase-errors"

describe("classifyFailure (códigos PostgREST)", () => {
  it("não reinterpreta códigos PostgREST como HTTP numérico via parseInt", () => {
    // Antes, parseInt("PGRST116") produzia NaN e caía em 404 com a mensagem
    // errada de "API não publicada".
    expect(classifyFailure("PGRST116")).toEqual({
      kind: "not-found",
      status: 404,
    })

    expect(classifyFailure("PGRST204")).toEqual({
      kind: "schema",
      status: null,
    })
  })

  it("classifica falha de sessão para JWT expirado", () => {
    expect(classifyFailure("PGRST301")).toEqual({
      kind: "session",
      status: 401,
    })
  })

  it("classifica violação de RLS como autorização", () => {
    expect(classifyFailure("42501")).toEqual({
      kind: "forbidden",
      status: 403,
    })
  })

  it("classifica tabela ausente como problema de tabela", () => {
    expect(classifyFailure("42P01")).toEqual({ kind: "table", status: 500 })

    expect(classifyFailure("PGRST205")).toEqual({ kind: "table", status: 500 })
  })

  it("classifica limite de taxa", () => {
    expect(classifyFailure("PGRST429")).toEqual({
      kind: "rate-limit",
      status: 429,
    })
  })

  it("trata códigos numéricos de três dígitos como HTTP", () => {
    expect(classifyFailure("401")).toEqual({ kind: "session", status: 401 })

    expect(classifyFailure("403")).toEqual({ kind: "forbidden", status: 403 })
  })

  it("retorna desconhecido para código não mapeado", () => {
    expect(classifyFailure("PGRST999")).toEqual({
      kind: "unknown",
      status: null,
    })

    expect(classifyFailure(null)).toEqual({ kind: "unknown", status: null })
  })
})

describe("kindFromStatus (modo local e fallbacks)", () => {
  it("mapeia status HTTP para tipos de falha", () => {
    expect(kindFromStatus(401)).toBe("session")

    expect(kindFromStatus(403)).toBe("forbidden")

    expect(kindFromStatus(404)).toBe("not-found")

    expect(kindFromStatus(429)).toBe("rate-limit")

    expect(kindFromStatus(500)).toBe("server")

    expect(kindFromStatus(400)).toBe("unknown")
  })
})

describe("AnimalApiError", () => {
  it("preserva o código PostgREST e o tipo classificado", () => {
    const error = new AnimalApiError(400, {
      code: "PGRST204",
      kind: "schema",
      message: "Could not find the 'updated_by' column of 'animals'.",
    })

    expect(error.code).toBe("PGRST204")

    expect(error.kind).toBe("schema")

    expect(error.status).toBe(400)

    expect(error.message).toContain("updated_by")
  })

  it("mantém compatibilidade com o modo local (apenas status)", () => {
    const error = new AnimalApiError(404)

    expect(error.status).toBe(404)

    expect(error.kind).toBe("not-found")
  })
})

describe("predicados de falha", () => {
  it("identifica falha de rede (TypeError)", () => {
    expect(isNetworkFailure(new TypeError("Failed to fetch"))).toBe(true)

    expect(isNetworkFailure(new Error("boom"))).toBe(false)
  })

  it("identifica erros PostgREST", () => {
    expect(isPostgrestFailure({ message: "x", code: "PGRST204" })).toBe(true)

    expect(isPostgrestFailure(new Error("x"))).toBe(false)

    expect(isPostgrestFailure(null)).toBe(false)
  })
})

describe("resourceFailureMessage", () => {
  it("nunca menciona a API antiga nem o proxy /api", () => {
    for (const kind of [
      "network",
      "session",
      "forbidden",
      "not-found",
      "schema",
      "table",
      "rate-limit",
      "server",
      "unknown",
    ] as const) {
      const message = resourceFailureMessage(kind, "animais")

      expect(message).not.toContain("proxy")

      expect(message).not.toContain("/api")

      expect(message).not.toContain("API pode não estar publicada")
    }
  })

  it("distingue tabela ausente de esquema divergente", () => {
    expect(resourceFailureMessage("table", "animais")).toContain("tabela")

    expect(resourceFailureMessage("schema", "animais")).toContain("migrations")
  })

  it("distingue sessão expirada de falta de permissão", () => {
    expect(resourceFailureMessage("session", "animais")).toContain("sessão")

    expect(resourceFailureMessage("forbidden", "animais")).toContain(
      "permissão",
    )
  })
})
