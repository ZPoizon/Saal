import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import {
  type AdminSession,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
  mapAuthError,
} from "../services/supabase-auth"

import { supabase } from "../lib/supabase"

interface AuthContextType {
  session: AdminSession | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      try {
        const current = await getAdminSession()
        if (mounted) setSession(current)
      } catch {
        if (mounted) setSession(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "SIGNED_OUT") {
        setSession(null)
        return
      }

      if (sess?.user) {
        void getAdminSession().then((current) => {
          if (mounted) setSession(current)
        })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await loginAdmin(email, password)
      const current = await getAdminSession()
      setSession(current)
    } catch (error) {
      throw mapAuthError(error, "login")
    }
  }

  const logout = async (): Promise<void> => {
    await logoutAdmin()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        login,
        logout,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
