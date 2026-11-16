const authApiPath = "/api/v1/auth"

export const csrfHeaderName = "X-CSRF-TOKEN"

export class AdminAuthError extends Error {
  constructor(readonly status: number) {
    super(`A autenticação administrativa respondeu com HTTP ${status}.`)

    this.name = "AdminAuthError"
  }
}

export async function getAdminSession(): Promise<boolean> {
  const response = await fetch(`${authApiPath}/session`, {
    credentials: "include",

    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new AdminAuthError(response.status)
  }

  const payload: unknown = await response.json()

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("authenticated" in payload) ||
    typeof payload.authenticated !== "boolean"
  ) {
    throw new Error("Resposta inválida ao consultar a sessão administrativa.")
  }

  return payload.authenticated
}

export async function loginAdmin(
  username: string,

  password: string,
): Promise<void> {
  const csrfToken = await requestCsrfToken()

  const response = await fetch(`${authApiPath}/login`, {
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

  const response = await fetch(`${authApiPath}/logout`, {
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
  const response = await fetch(`${authApiPath}/csrf`, {
    credentials: "include",

    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new AdminAuthError(response.status)
  }

  const payload: unknown = await response.json()

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("token" in payload) ||
    typeof payload.token !== "string" ||
    payload.token.length === 0 ||
    !("headerName" in payload) ||
    payload.headerName !== csrfHeaderName
  ) {
    throw new Error("Resposta inválida ao obter o token CSRF.")
  }

  return payload.token
}
