import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings as persistSiteSettings,
  type SiteSettings,
} from "../data/siteSettings"

const LOAD_ERROR =
  "Não foi possível ler as configurações salvas neste navegador. Os textos padrão da demonstração estão sendo exibidos."

const SAVE_ERROR =
  "Não foi possível salvar neste navegador. Verifique o espaço disponível e as permissões do navegador."

interface SiteSettingsContextValue {
  settings: SiteSettings

  storageError: string | null

  saveSettings: (settings: SiteSettings) => boolean
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(
  undefined,
)

function getInitialState(): {
  settings: SiteSettings

  storageError: string | null
} {
  try {
    return {
      settings: loadSiteSettings(window.localStorage),

      storageError: null,
    }
  } catch {
    return {
      settings: defaultSiteSettings,

      storageError: LOAD_ERROR,
    }
  }
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(getInitialState)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "saal.site-settings.v1" && event.key !== null) return

      try {
        setState({
          settings: loadSiteSettings(window.localStorage),

          storageError: null,
        })
      } catch {
        setState((current) => ({ ...current, storageError: LOAD_ERROR }))
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const saveSettings = useCallback((settings: SiteSettings): boolean => {
    try {
      persistSiteSettings(window.localStorage, settings)

      setState({ settings, storageError: null })

      return true
    } catch {
      setState((current) => ({ ...current, storageError: SAVE_ERROR }))

      return false
    }
  }, [])

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
