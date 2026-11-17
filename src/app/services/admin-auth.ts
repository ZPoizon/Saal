/**
 * Autenticação administrativa em modo protótipo local.
 *
 * O frontend está rodando sem API por decisão do responsável pelo projeto
 * (registrada em `specs/decisions/ADR-008-frontend-modo-local.md`). O acesso ao
 * painel usa uma credencial simples fixada no código, apenas para o protótipo:
 *
 * ATENÇÃO: isto NÃO é autenticação real. A credencial está visível no código
 * fonte e a sessão vive no `sessionStorage` do navegador, sem servidor. Não
 * reutilize esta senha em produção. Quando a integração com a API for religada,
 * as funções abaixo voltam a validar a sessão via `/api/v1/auth` (ADR-006).
 */

export const csrfHeaderName = "X-CSRF-TOKEN"

/** Credencial exclusiva do protótipo local (nunca usar em produção). */

const localAdminUsername = "admin"

const localAdminPassword = "saal2026"

const LOCAL_SESSION_STORAGE_KEY = "saal.local.admin-session.v1"

export type AdminAuthFailure = "network" | "unauthorized" | "forbidden" | "rate-limited" | "not-found" | "server" | "invalid-response" | "unknown"

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

function failureFromStatus(status: number): AdminAuthFailure {
  if (status === 401) return "unauthorized"

  if (status === 403) return "forbidden"

  if (status === 404) return "not-found"

  if (status === 429) return "rate-limited"

  if (status >= 500) return "server"

  return "unknown"
}

/** Resolve o `sessionStorage` do navegador de forma preguiçosa (o ambiente de
 * testes injeta um Storage próprio). */

export function browserSessionStorage(): Storage {
  const candidate = (globalThis as { sessionStorage?: Storage }).sessionStorage

  if (!candidate) {
    throw new Error("sessionStorage indisponível neste ambiente.")
  }

  return candidate
}

/** Sessão local: vale enquanto a aba do navegador estiver aberta. */

export async function getAdminSession(
  storage: Storage = browserSessionStorage(),
): Promise<boolean> {
  try {
    return storage.getItem(LOCAL_SESSION_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

/** Login local: valida a credencial do protótipo e marca a sessão na aba. */

export async function loginAdmin(
  username: string,

  password: string,

  storage: Storage = browserSessionStorage(),
): Promise<void> {
  if (username !== localAdminUsername || password !== localAdminPassword) {
    throw new AdminAuthError(401)
  }

  storage.setItem(LOCAL_SESSION_STORAGE_KEY, "1")
}

/** Logout local: apenas limpa a marca de sessão desta aba. */

export async function logoutAdmin(
  storage: Storage = browserSessionStorage(),
): Promise<void> {
  storage.removeItem(LOCAL_SESSION_STORAGE_KEY)
}

/** Modo local: token constante, pois nenhuma requisição de servidor é feita. */

export async function requestCsrfToken(): Promise<string> {
  return "local-mode"
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
