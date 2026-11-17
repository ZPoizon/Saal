import { describe, expect, it } from "vitest"

import { getMailHref, getPhoneHref, getWhatsAppHref } from "./siteLinks"

describe("public contact links", () => {
  it("normalizes Brazilian phone numbers for telephone and WhatsApp links", () => {
    const phone = "+55 15 99663-1983"

    expect(getPhoneHref(phone)).toBe("tel:+5515996631983")

    expect(getWhatsAppHref(phone)).toBe(
      "https://wa.me/5515996631983?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20SAAL%20e%20gostaria%20de%20saber%20mais.",
    )
  })

  it("omits a mail link when the email is empty", () => {
    expect(getMailHref("")).toBeNull()

    expect(getMailHref("  ong@example.org ")).toBe("mailto:ong@example.org")
  })
})
