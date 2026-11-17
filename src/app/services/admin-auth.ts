const authApiPath = "/api/v1/auth"

export const csrfHeaderName = "X-CSRF-TOKEN"

export type AdminAuthFailure = "network" | "unauthorized" | "forbidden" | "rate-limited" | "not-found" | "server" | "invalid-response" | "unknown"

function failureFromStatus(status: number): AdminAuthFailure {
  if (status === 401) return "unauthorized"

  if (status === 403) return "forbidden"

  if (status === 404) return "not-found"

  if (status === 429) return "rate-limited"

  if (status >= 500) return "server"

  return "unknown"
}

export class AdminAuthError extends Error {
  readonly status: number

  readonly failure: AdminAuthFailure

  constructor(
    status: number,

    failure: AdminAuthFailure = failureFromStatus(status),
  ) {
    super(
      status > 0
        ? `A autenticação administrativa respondeu com HTTP ${status}.`
        : "Não foi possível conectar à autenticação administrativa.",
    )

    this.name = "AdminAuthError"

    this.status = status

    this.failure = failure
  }
}

async function authFetch(
  input: RequestInfo | URL,

  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }

    throw new AdminAuthError(0, "network")
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new AdminAuthError(response.status, "invalid-response")
  }
}

export async function getAdminSession(): Promise<boolean> {
  const response = await authFetch(`${authApiPath}/session`, {
    credentials: "include",

    headers: { Accept: "application/json" },
  })

  // O endpoint de sessão é público. Um proxy/API que responda 401/403 para ele

  // significa que não há sessão utilizável, não que a validação quebrou.

  if (response.status === 401 || response.status === 403) {
    return false
  }

  if (!response.ok) {
    throw new AdminAuthError(response.status)
  }

  const payload = await readJson(response)

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("authenticated" in payload) ||
    typeof payload.authenticated !== "boolean"
  ) {
    throw new AdminAuthError(response.status, "invalid-response")
  }

  return payload.authenticated
}

export async function loginAdmin(
  username: string,

  password: string,
): Promise<void> {
  const csrfToken = await requestCsrfToken()

  const response = await authFetch(`${authApiPath}/login`, {
    method: "POST",

    credentials: "include",

    headers: {
      Accept: "application/json",

      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",

      [csrfHeaderName]: csrfToken,
    },

    body: new URLSearchParams({ username, password }),
  })

  if (!response.ok) {
    throw new AdminAuthError(response.status)
  }
}

export async function logoutAdmin(): Promise<void> {
  const csrfToken = await requestCsrfToken()

  const response = await authFetch(`${authApiPath}/logout`, {
    method: "POST",

    credentials: "include",

    headers: {
      Accept: "application/json",

      [csrfHeaderName]: csrfToken,
    },
  })

  if (!response.ok) {
    throw new AdminAuthError(response.status)
  }
}

export async function requestCsrfToken(): Promise<string> {
  const response = await authFetch(`${authApiPath}/csrf`, {
    credentials: "include",

    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new AdminAuthError(response.status)
  }

  const payload = await readJson(response)

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("token" in payload) ||
    typeof payload.token !== "string" ||
    payload.token.length === 0 ||
    !("headerName" in payload) ||
    payload.headerName !== csrfHeaderName
  ) {
    throw new AdminAuthError(response.status, "invalid-response")
  }

  return payload.token
}

export type AdminAuthAction = "session" | "login" | "logout"

/**
 * Traduz falhas de autenticação em mensagens que separam problema de conexão,
 * API ausente, erro do servidor e credencial inválida. Nunca revela detalhes
 * internos nem transforma erro de rede em "senha incorreta".
 */

export function getAdminAuthErrorMessage(
  error: unknown,

  action: AdminAuthAction,
): string {
  if (!(error instanceof AdminAuthError)) {
    return action === "session"
      ? "Não foi possível validar a sessão. Verifique a conexão e tente novamente."
      : "Não foi possível concluir a operação. Tente novamente."
  }

  switch (error.failure) {
    case "network":
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."

    case "not-found":
      return "O serviço de autenticação não foi encontrado. A API ou o proxy /api não está configurado neste ambiente."

    case "invalid-response":
      return "O servidor respondeu em um formato inesperado. Verifique se o proxy /api aponta para a API correta."

    case "server":
      return "O servidor está temporariamente indisponível. Tente novamente em instantes."

    case "rate-limited":
      return "Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente."

    case "forbidden":
      return action === "login"
        ? "A verificação de segurança expirou. Recarregue a página e tente novamente."
        : "A sessão de segurança expirou. Recarregue a página e tente novamente."

    case "unauthorized":
      if (action === "login") return "Usuário ou senha inválidos."

      if (action === "session") return "Sessão expirada. Entre novamente."

      return "Você não tem autorização para esta operação."

    default:
      return action === "session"
        ? "Não foi possível validar a sessão. Tente novamente."
        : "Não foi possível concluir a operação. Tente novamente."
  }
}
