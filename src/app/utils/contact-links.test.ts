import { describe, expect, it } from "vitest"

import { buildInterestContactLinks } from "./contact-links"

describe("buildInterestContactLinks", () => {
  it("normalizes a Brazilian phone and safely encodes the prefilled WhatsApp text", () => {
    const links = buildInterestContactLinks({
      whatsapp: "(15) 99692-7636",

      email: "ana@example.com",
    })

    expect(links.whatsapp).toBe("https://wa.me/5515996927636")

    expect(links.phone).toBe("tel:+5515996927636")

    expect(links.email).toBe("mailto:ana%40example.com")
  })

  it("does not create contact destinations from invalid values", () => {
    expect(
      buildInterestContactLinks({
        whatsapp: "javascript:alert(1)",

        email: "ana@example.com?subject=injected",
      }),
    ).toEqual({})
  })
})
