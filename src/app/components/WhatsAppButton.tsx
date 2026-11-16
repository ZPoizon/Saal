import { MessageCircle } from "lucide-react"

import { useSiteSettings } from "../contexts/SiteSettingsContext"

import { getWhatsAppHref } from "../data/siteLinks"

export function WhatsAppButton() {
  const { settings } = useSiteSettings()

  const href = getWhatsAppHref(settings.contact.whatsapp)

  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-7 h-7" fill="white" />
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Fale conosco!
      </span>
    </a>
  )
}
