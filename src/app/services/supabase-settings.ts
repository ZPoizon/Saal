import type { SiteSettings } from "../data/siteSettings"
import { supabase } from "../lib/supabase"

const SETTINGS_KEY = "saal.site-settings.v1"

/**
 * Carrega as configurações do site do banco.
 *
 * Estados distintos, sem mascarar erros:
 * - Chave ausente (site sem configuração personalizada): estado válido,
 *   retorna `null` — o contexto mantém `defaultSiteSettings`. Usa
 *   `.maybeSingle()` porque `.single()` respondia HTTP 406 (PGRST116)
 *   quando a chave ainda não existia.
 * - Falha de conexão ou de permissão: propaga o erro para o chamador
 *   (SiteSettingsContext exibe o aviso de falha de carregamento).
 */
export async function loadSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle()

  if (error) {
    throw new Error(
      `Não foi possível carregar as configurações do site: ${error.message}`,
    )
  }

  if (!data || data.value == null) {
    return null
  }

  return data.value as unknown as SiteSettings
}

/** Salva as configurações do site no banco. */
export async function saveSiteSettings(
  settings: SiteSettings,
  updatedBy: string | null,
): Promise<void> {
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: SETTINGS_KEY,
      value: settings,
      updated_by: updatedBy,
    },
    { onConflict: "key" },
  )

  if (error) {
    throw new Error(`Não foi salvar as configurações: ${error.message}`)
  }
}
