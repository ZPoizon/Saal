import type { SiteSettings } from "./siteSettings"

export function getPhoneHref(phone: string): string | null {
  let digits = phone.replace(/\D/g, "")

  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`

  return digits ? `tel:+${digits}` : null
}

export function getWhatsAppHref(whatsapp: string): string | null {
  let digits = whatsapp.replace(/\D/g, "")

  if (!digits) return null

  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`

  return `https://wa.me/${digits}?text=${encodeURIComponent(
    "Olá! Vim pelo site da SAAL e gostaria de saber mais.",
  )}`
}

export function getMailHref(email: string): string | null {
  return email.trim() ? `mailto:${email.trim()}` : null
}

export function getPublicLocation(contact: SiteSettings["contact"]): string {
  return [
    contact.address,
    [contact.city, contact.state].filter(Boolean).join(" - "),
  ]

    .filter(Boolean)

    .join(", ")
}

export function isAllowedPublicUrl(value: string): boolean {
  if (!value) return false

  try {
    const url = new URL(value)

    return url.protocol === "https:" && !url.username && !url.password
  } catch {
    return false
  }
}
