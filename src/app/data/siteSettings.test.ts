import { describe, expect, it } from "vitest"

import {
  defaultSiteSettings,
  getActiveCampaigns,
  getCurrentAnimalCounts,
  getHistoricalImpactTotals,
  loadSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_STORAGE_KEY,
  type SiteSettings,
} from "./siteSettings"

import type { Animal } from "./animals"

class MemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  private values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

describe("site settings", () => {
  it("uses empty historical values and hides unconfirmed public statistics", () => {
    expect(defaultSiteSettings.statistics.historicalRescues).toBeNull()

    expect(defaultSiteSettings.statistics.historicalAdoptions).toBeNull()

    expect(defaultSiteSettings.statistics.showRescued).toBe(false)

    expect(defaultSiteSettings.statistics.showAdoptions).toBe(false)

    expect(defaultSiteSettings.statistics.showSystemCounts).toBe(false)
  })

  it("persists and reloads all settings", () => {
    const storage = new MemoryStorage()

    const changed: SiteSettings = {
      ...defaultSiteSettings,

      home: { ...defaultSiteSettings.home, title: "Novo título" },

      contact: { ...defaultSiteSettings.contact, email: "ong@example.org" },
    }

    saveSiteSettings(storage, changed)

    expect(loadSiteSettings(storage)).toEqual(changed)
  })

  it("rejects malformed or unsafe persisted data", () => {
    const storage = new MemoryStorage()

    const invalid = {
      ...defaultSiteSettings,

      home: {
        ...defaultSiteSettings.home,

        heroImageUrl: "javascript:alert(1)",
      },
    }

    storage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(invalid))

    expect(() => loadSiteSettings(storage)).toThrow(
      "Saved site settings are invalid.",
    )
  })

  it("derives live animal counts from available records", () => {
    const animals = [
      { status: "available" },

      { status: "adopted" },

      { status: "treatment" },
    ] as Animal[]

    expect(getCurrentAnimalCounts(animals)).toEqual({
      registered: 3,

      available: 1,

      adopted: 1,

      treatment: 1,
    })
  })

  it("adds only pre-system history to counts from current records", () => {
    const animals = [
      { status: "available" },

      { status: "adopted" },
    ] as Animal[]

    const statistics = {
      ...defaultSiteSettings.statistics,

      historicalRescues: 4,

      historicalAdoptions: 2,
    }

    expect(getHistoricalImpactTotals(statistics, animals)).toEqual({
      rescued: 6,

      adoptions: 3,
    })
  })

  it("filters hidden, future, and expired campaigns", () => {
    const campaigns = [
      {
        id: "active",

        type: "evento",

        title: "Feira",

        description: "",

        startDate: "2026-11-16",

        endDate: "2026-11-17",

        imageUrl: "",

        visible: true,
      },

      {
        id: "expired",

        type: "aviso",

        title: "Aviso",

        description: "",

        startDate: "",

        endDate: "2026-11-15",

        imageUrl: "",

        visible: true,
      },

      {
        id: "hidden",

        type: "campanha",

        title: "Campanha",

        description: "",

        startDate: "",

        endDate: "",

        imageUrl: "",

        visible: false,
      },
    ] as SiteSettings["campaigns"]

    expect(
      getActiveCampaigns(campaigns, "2026-11-16").map(({ id }) => id),
    ).toEqual(["active"])
  })
})
