interface InterestContact {
  whatsapp: string

  email: string
}

export interface InterestContactLinks {
  whatsapp?: string

  phone?: string

  email?: string
}

export function buildInterestContactLinks({
  whatsapp,

  email,
}: InterestContact): InterestContactLinks {
  const digits = whatsapp.replace(/\D/g, "")

  const internationalNumber =
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits

  const validPhone =
    internationalNumber.length >= 12 && internationalNumber.length <= 15

  const validEmail = /^[^\s@?#]+@[^\s@?#.]+(?:\.[^\s@?#.]+)+$/u.test(
    email.trim(),
  )

  return {
    ...(validPhone && {
      whatsapp: `https://wa.me/${internationalNumber}`,

      phone: `tel:+${internationalNumber}`,
    }),

    ...(validEmail && { email: `mailto:${encodeURIComponent(email.trim())}` }),
  }
}
