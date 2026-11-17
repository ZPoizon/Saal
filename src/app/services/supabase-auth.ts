import {
  type AdminAuthFailure,
  AdminAuthError,
  type AdminAuthAction,
  getAdminAuthErrorMessage,
} from "./admin-auth"
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
      .single()

    if (adminError || !admin) {
      return null
    }

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role as "admin",
      displayName: admin.display_name,
    }
  } catch {
    return null
  }
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

  // Garante que o registro exista em admin_users (criado pelo trigger ou administrador)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { error: upsertError } = await supabase
      .from("admin_users")
      .upsert(
        {
          id: user.id,
          email: user.email ?? "",
          role: "admin",
          display_name: user.user_metadata?.display_name ??
            user.email?.split("@")[0] ??
            "Administrador",
        },
        { onConflict: "id" },
      )

    if (upsertError) {
      // Não bloqueia o login por causa disso; o registro pode ser criado depois
      console.warn("Não foi possível atualizar registro admin_users:", upsertError.message)
    }
  }
}

export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut()
}

export async function requestCsrfToken(): Promise<string> {
  // Supabase gerencia CSRF automaticamente; retorna um marcador para compatibilidade.
  return "supabase-auth"
}

export function mapAuthError(
  error: unknown,
  action: AdminAuthAction,
): string {
  if (error instanceof AdminAuthError) {
    return getAdminAuthErrorMessage(error, action)
  }

  return action === "session"
    ? "Não foi possível validar a sessão. Verifique a conexão e tente novamente."
    : "Não foi possível concluir a operação. Tente novamente."
}
