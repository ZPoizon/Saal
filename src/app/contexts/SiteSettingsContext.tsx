import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { defaultSiteSettings, type SiteSettings } from "../data/siteSettings"

import { supabase } from "../lib/supabase"

import {
  loadSiteSettings as loadSupabaseSettings,
  saveSiteSettings as saveSupabaseSettings,
} from "../services/supabase-settings"

const LOAD_ERROR =
  "Não foi possível ler as configurações do servidor. Os textos padrão estão sendo exibidos."

const SAVE_ERROR =
  "Não foi possível salvar as configurações no servidor. Verifique sua conexão e tente novamente."

interface SiteSettingsContextValue {
  settings: SiteSettings

  storageError: string | null

  saving: boolean

  saveSettings: (settings: SiteSettings) => Promise<boolean>
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(
  undefined,
)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    settings: SiteSettings

    storageError: string | null

    saving: boolean
  }>({
    settings: defaultSiteSettings,

    storageError: null,

    saving: false,
  })

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      try {
        const saved = await loadSupabaseSettings()

        if (mounted && saved) {
          setState((current) => ({
            ...current,

            settings: saved,

            storageError: null,
          }))
        }
      } catch {
        if (mounted) {
          setState((current) => ({
            ...current,

            storageError: LOAD_ERROR,
          }))
        }
      }
    }

    void loadSettings()
  }, [])

  const saveSettings = useCallback(
    async (settings: SiteSettings): Promise<boolean> => {
      try {
        setState((current) => ({ ...current, saving: true }))

        const {
          data: { user },
        } = await supabase.auth.getUser()

        await saveSupabaseSettings(settings, user?.id ?? null)

        setState((current) => ({
          ...current,

          settings,

          storageError: null,

          saving: false,
        }))

        return true
      } catch {
        setState((current) => ({
          ...current,

          storageError: SAVE_ERROR,

          saving: false,
        }))

        return false
      }
    },
    [],
  )

  return (
    <SiteSettingsContext.Provider value={{ ...state, saveSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)

  if (!context) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider",
    )
  }

  return context
}
