import { describe, expect, it } from "vitest"

import {
  isValidEmail,
  isValidWhatsapp,
  validateInterestForm,
} from "./interest-validation"

const validInterest = {
  fullName: "Maria Silva",

  whatsapp: "(11) 99999-9999",

  city: "São Paulo",

  email: "maria@example.com",
}

describe("interest form validation", () => {
  it("accepts valid contact data and trims text fields", () => {
    expect(
      validateInterestForm({
        ...validInterest,

        fullName: "  Maria Silva  ",

        city: " São Paulo ",
      }),
    ).toEqual({})
  })

  it("rejects empty, too short, and oversized text fields", () => {
    expect(
      validateInterestForm({
        ...validInterest,

        fullName: "  ",

        city: " ",

        email: "",

        whatsapp: "",
      }),
    ).toEqual({
      fullName: "Informe seu nome completo.",

      whatsapp: "Informe um WhatsApp válido, com DDD.",

      city: "Informe sua cidade.",

      email: "Informe um e-mail válido.",
    })

    expect(
      validateInterestForm({
        ...validInterest,

        fullName: "a".repeat(121),

        city: "a".repeat(121),
      }),
    ).toMatchObject({
      fullName: "Informe seu nome completo.",

      city: "Informe sua cidade.",
    })
  })

  it("rejects malformed WhatsApp and e-mail values", () => {
    expect(isValidWhatsapp("abc (11) 99999-9999")).toBe(false)

    expect(isValidWhatsapp("+55 (11) 99999-9999")).toBe(true)

    expect(isValidEmail("maria@example.com")).toBe(true)

    expect(isValidEmail("maria@example.com?subject=private")).toBe(false)
  })
})
