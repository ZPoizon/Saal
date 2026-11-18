/**
 * Classificação de falhas do Supabase (PostgREST e rede).
 *
 * Módulo puro, sem importar o cliente `supabase`: pode ser testado com vitest
 * e reaproveitado por qualquer serviço. O objetivo é distinguir conexão,
 * sessão, autorização, tabela, esquema e ausência de registros — nunca
 * reinterpretando códigos PostgREST (ex.: `PGRST116`) como códigos HTTP via
 * `parseInt`.
 */

export type FailureKind = "network" | "session" | "forbidden" | "not-found" | "schema" | "table" | "rate-limit" | "server" | "unknown"

/** Subconjunto do erro retornado pelo supabase-js em consultas PostgREST. */
export interface PostgrestFailureLike {
  message: string

  code?: string | null

  details?: string | null

  hint?: string | null
}

/** Erros conhecidos do PostgREST e do gateway do Supabase. */
const KIND_BY_CODE: Record<string, FailureKind> = {
  // Sessão: JWT expirado, ausente ou inválido.
  PGRST301: "session",
  PGRST302: "session",

  // Autorização: violação da política de RLS (insufficient_privilege).
  "42501": "forbidden",

  // `.single()` sem linhas (PGRST116) ou mais de uma linha (PGRST117).
  PGRST116: "not-found",
  PGRST117: "not-found",

  // Esquema: coluna inexistente no cache do esquema (PGRST204) ou payload
  // incompatível com a estrutura publicada.
  PGRST204: "schema",
  PGRST203: "schema",
  PGRST200: "schema",

  // Tabela ausente: relação não existe (42P01) ou não está no cache (PGRST205).
  "42P01": "table",
  PGRST205: "table",

  // Limite de taxa do gateway do Supabase.
  PGRST429: "rate-limit",
}

function kindFromHttpStatus(status: number): FailureKind {
  if (status === 401) return "session"
  if (status === 403) return "forbidden"
  if (status === 404) return "not-found"
  if (status === 429) return "rate-limit"
  if (status >= 500) return "server"
  return "unknown"
}

/** Tipo de falha a partir de um status HTTP (usado no modo local e fallbacks). */
export function kindFromStatus(status: number): FailureKind {
  return kindFromHttpStatus(status)
}

/**
 * Interpreta um erro PostgREST. Códigos numéricos de três dígitos (raro, mas
 * usado por gateways) são tratados como HTTP; os demais são consultados na
 * tabela de códigos PostgREST.
 */
export function classifyFailure(
  code: string | null | undefined,
): {
  kind: FailureKind
  status: number | null
} {
  if (!code) return { kind: "unknown", status: null }

  const direct = KIND_BY_CODE[code]

  if (direct) {
    return { kind: direct, status: directStatus(direct) }
  }

  // Códigos puramente numéricos de três dígitos representam HTTP.
  if (/^\d{3}$/.test(code)) {
    const status = Number(code)
    return { kind: kindFromHttpStatus(status), status }
  }

  // Violações de integridade/validação do PostgreSQL (classe 22/23): dados
  // rejeitados pelo banco, por exemplo check constraint do status.
  if (/^2[23]/.test(code)) {
    return { kind: "unknown", status: 400 }
  }

  return { kind: "unknown", status: null }
}

function directStatus(kind: FailureKind): number | null {
  switch (kind) {
    case "session":
      return 401
    case "forbidden":
      return 403
    case "not-found":
      return 404
    case "rate-limit":
      return 429
    case "table":
      return 500
    default:
      return null
  }
}

export function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError
}

export function isPostgrestFailure(
  error: unknown,
): error is PostgrestFailureLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    typeof (error as PostgrestFailureLike).message === "string"
  )
}

const NETWORK_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."

/**
 * Mensagem compreensível para administradores, por tipo de falha. Detalhes
 * técnicos sensíveis nunca são incluídos: apenas o código PostgREST pode ser
 * exibido à parte, para diagnóstico seguro.
 */
export function resourceFailureMessage(
  kind: FailureKind,
  resource: string,
): string {
  switch (kind) {
    case "network":
      return NETWORK_MESSAGE
    case "session":
      return "Sua sessão expirou. Entre novamente para continuar."
    case "forbidden":
      return `Sua sessão não tem permissão para acessar os ${resource}. Entre novamente com uma conta administradora.`
    case "not-found":
      return `Registro de ${resource} não encontrado. Ele pode ter sido excluído ou sua sessão pode não ter permissão para acessá-lo.`
    case "schema":
      return "A estrutura do banco de dados está diferente da esperada. Verifique se as migrations do Supabase estão aplicadas."
    case "table":
      return `A tabela de ${resource} não está disponível no banco de dados. Aplique as migrations do Supabase para criá-la.`
    case "rate-limit":
      return "Muitas solicitações em pouco tempo. Aguarde alguns instantes e tente novamente."
    case "server":
      return "O servidor está temporariamente indisponível. Tente novamente em instantes."
    default:
      return `Não foi possível carregar os ${resource}. Tente novamente.`
  }
}
