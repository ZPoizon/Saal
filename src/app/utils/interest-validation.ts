export interface InterestFormValues {
  fullName: string

  whatsapp: string

  city: string

  email: string
}

export type InterestFieldErrors = Partial<Record<keyof InterestFormValues, string>>

const emailPattern = /^[^\s@?#]+@[^\s@?#.]+(?:\.[^\s@?#.]+)+$/u

const whatsappCharactersPattern = /^\+?[\d\s().-]+$/u

const fullNameMin = 3

const fullNameMax = 120

const cityMin = 2

const cityMax = 120

const whatsappMinDigits = 10

const whatsappMaxDigits = 15

export function isValidWhatsapp(value: string): boolean {
  const normalized = value.trim()

  if (!whatsappCharactersPattern.test(normalized)) return false

  const digits = normalized.replace(/\D/g, "")

  return (
    digits.length >= whatsappMinDigits && digits.length <= whatsappMaxDigits
  )
}

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim())
}

/**
 * Valida os campos no cliente antes do envio. O backend repete a validacao de forma
 * autoritativa; esta funcao apenas evita requisicoes obviamente invalidas.
 */

export function validateInterestForm(
  values: InterestFormValues,
): InterestFieldErrors {
  const errors: InterestFieldErrors = {}

  const fullName = values.fullName.trim()

  if (fullName.length < fullNameMin || fullName.length > fullNameMax) {
    errors.fullName = "Informe seu nome completo."
  }

  if (!isValidWhatsapp(values.whatsapp)) {
    errors.whatsapp = "Informe um WhatsApp válido, com DDD."
  }

  const city = values.city.trim()

  if (city.length < cityMin || city.length > cityMax) {
    errors.city = "Informe sua cidade."
  }

  if (!isValidEmail(values.email)) {
    errors.email = "Informe um e-mail válido."
  }

  return errors
}
