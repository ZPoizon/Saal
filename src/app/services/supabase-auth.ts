import {
  type AdminAuthFailure,
  AdminAuthError,
  type AdminAuthAction,
  getAdminAuthErrorMessage,
} from "./admin-auth"
import { classifyFailure } from "./supabase-errors"
import { supabase } from "../lib/supabase"

export type AdminSession = {
  id: string
  email: string
  role: "admin"
  displayName: string
}

/**
 * Autenticação administrativa real via Supabase Auth.
 *
 * Substitui o login local simples (senha fixa no código) por autenticação
 * verificada pelo Supabase, com sessão persistente e RLS no banco de dados.
 *
 * A variável VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar
 * definidas no ambiente. O segredo da API do Supabase nunca é exposto no
 * frontend: apenas a chave pública anônima é usada pelo navegador.
 */

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return null
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id, email, role, display_name")
      .eq("id", session.user.id)
      .maybeSingle()

    if (adminError) {
      // Falha real de conexão ou de permissão: não deve ser tratada como
      // "sessão expirada". Propaga para o chamador exibir o motivo correto.
      const { status, failure } = adminFailureFromPostgrest(adminError.code)

      throw new AdminAuthError(status, failure)
    }

    // Sem registro em admin_users: usuário autenticado, porém sem
    // autorização administrativa (nenhum registro é criado aqui).
    if (!admin) {
      return null
    }

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role as "admin",
      displayName: admin.display_name,
    }
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error
    }

    return null
  }
}

/**
 * Mapeia o código PostgREST de consultas de autorização para tipo de falha e
 * status HTTP equivalente. Códigos desconhecidos viram falha de rede
 * (com nova tentativa), nunca permissão.
 */
function adminFailureFromPostgrest(
  code: string | null | undefined,
): {
  status: number
  failure: AdminAuthFailure
} {
  const { kind, status } = classifyFailure(code)

  switch (kind) {
    case "session":
      return { status: status ?? 401, failure: "unauthorized" }

    case "forbidden":
      return { status: status ?? 403, failure: "forbidden" }

    case "rate-limit":
      return { status: status ?? 429, failure: "rate-limited" }

    case "server":
      return { status: status ?? 500, failure: "server" }

    default:
      return { status: status ?? 0, failure: "network" }
  }
}

/** Mapeia o status HTTP de erros do Supabase Auth para tipos de falha. */
function authFailureFromAuthStatus(
  status: number | null | undefined,
): AdminAuthFailure {
  if (status === 401) return "unauthorized"

  if (status === 403) return "forbidden"

  if (status === 429) return "rate-limited"

  if (status !== null && status !== undefined && status >= 500) return "server"

  return "network"
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const failure: AdminAuthFailure =
      error.status === 401
        ? "unauthorized"
        : error.status === 429
          ? "rate-limited"
          : error.status === 403
            ? "forbidden"
            : error.status && error.status >= 500
              ? "server"
              : "network"

    throw new AdminAuthError(error.status ?? 0, failure)
  }

  // A autorização administrativa precisa existir ANTES do login: apenas
  // usuários previamente cadastrados em `admin_users` podem acessar o painel.
  // Nenhum registro é criado ou promovido automaticamente aqui — o upsert
  // antigo respondia HTTP 403 e tentaria auto-promover contas comuns.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    await supabase.auth.signOut()

    if (userError) {
      throw new AdminAuthError(
        userError.status ?? 0,
        authFailureFromAuthStatus(userError.status),
      )
    }

    throw new AdminAuthError(401, "unauthorized")
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (adminError) {
    await supabase.auth.signOut()

    const { status, failure } = adminFailureFromPostgrest(adminError.code)

    throw new AdminAuthError(status, failure)
  }

  if (!admin) {
    await supabase.auth.signOut()

    throw new AdminAuthError(403, "forbidden")
  }
}

export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut()
}

export async function requestCsrfToken(): Promise<string> {
  // Supabase gerencia CSRF automaticamente; retorna um marcador para compatibilidade.
  return "supabase-auth"
}

export function mapAuthError(error: unknown, action: AdminAuthAction): string {
  if (error instanceof AdminAuthError) {
    return getAdminAuthErrorMessage(error, action)
  }

  return action === "session"
    ? "Não foi possível validar a sessão. Verifique a conexão e tente novamente."
    : "Não foi possível concluir a operação. Tente novamente."
}
