interface InterestContact {
  name: string

  whatsapp: string

  email: string

  animalName: string
}

export interface InterestContactLinks {
  whatsapp?: string

  phone?: string

  email?: string
}

export function buildInterestContactLinks({
  name,

  whatsapp,

  email,

  animalName,
}: InterestContact): InterestContactLinks {
  const digits = whatsapp.replace(/\D/g, "")

  const internationalNumber =
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits

  const validPhone =
    internationalNumber.length >= 12 && internationalNumber.length <= 15

  const message = `Olá, ${name.trim() || "tudo bem"}! Gostaria de conversar sobre seu interesse em adotar ${animalName.trim() || "um animal"}.`

  const validEmail = /^[^\s@?#]+@[^\s@?#.]+(?:\.[^\s@?#.]+)+$/u.test(
    email.trim(),
  )

  return {
    ...(validPhone && {
      whatsapp: `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`,

      phone: `tel:+${internationalNumber}`,
    }),

    ...(validEmail && { email: `mailto:${encodeURIComponent(email.trim())}` }),
  }
}
