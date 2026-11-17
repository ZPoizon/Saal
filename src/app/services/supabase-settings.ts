import type { SiteSettings } from "../data/siteSettings"
import { supabase } from "../lib/supabase"

const SETTINGS_KEY = "saal.site-settings.v1"

/** Carrega as configurações do site do banco. */
export async function loadSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .single()

  if (error || !data) {
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
