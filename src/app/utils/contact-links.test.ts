import { describe, expect, it } from "vitest"

import { buildInterestContactLinks } from "./contact-links"

describe("buildInterestContactLinks", () => {
  it("normalizes a Brazilian phone and safely encodes the prefilled WhatsApp text", () => {
    const links = buildInterestContactLinks({
      name: "Ana & João",

      whatsapp: "(15) 99692-7636",

      email: "ana@example.com",

      animalName: "Luna & Thor",
    })

    expect(links.whatsapp).toContain("https://wa.me/5515996927636?text=")

    expect(new URL(links.whatsapp ?? "").searchParams.get("text")).toBe(
      "Olá, Ana & João! Gostaria de conversar sobre seu interesse em adotar Luna & Thor.",
    )

    expect(links.phone).toBe("tel:+5515996927636")

    expect(links.email).toBe("mailto:ana%40example.com")
  })

  it("does not create contact destinations from invalid values", () => {
    expect(
      buildInterestContactLinks({
        name: "Ana",

        whatsapp: "javascript:alert(1)",

        email: "ana@example.com?subject=injected",

        animalName: "Luna",
      }),
    ).toEqual({})
  })
})
