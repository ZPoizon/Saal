import type { Animal } from "./animals"

export type PrimaryButtonDestination = "/animais" | "/contato" | "/#doacoes"

export type CampaignType = "campanha" | "aviso" | "feira" | "evento"

export interface AdoptionStep {
  title: string

  description: string
}

export interface AdoptionQuestion {
  question: string

  answer: string
}

export interface SiteCampaign {
  id: string

  type: CampaignType

  title: string

  description: string

  startDate: string

  endDate: string

  imageUrl: string

  visible: boolean
}

export interface SiteSettings {
  statistics: {
    historicalRescues: number | null

    historicalAdoptions: number | null

    startYear: number | null

    showRescued: boolean

    showAdoptions: boolean

    showTreatment: boolean

    showStartYear: boolean

    showSystemCounts: boolean

    historicalUpdatedAt: string | null
  }

  home: {
    title: string

    subtitle: string

    presentationText: string

    heroImageUrl: string

    primaryButtonText: string

    primaryButtonDestination: PrimaryButtonDestination

    highlightMessage: string
  }

  contact: {
    phone: string

    whatsapp: string

    email: string

    address: string

    city: string

    state: string

    instagram: string

    facebook: string

    hours: string
  }

  donations: {
    enabled: boolean

    pixKey: string

    beneficiary: string

    instructions: string

    qrCodeUrl: string

    campaign: string
  }

  adoption: {
    explanation: string

    requirements: string

    steps: AdoptionStep[]

    faqs: AdoptionQuestion[]

    submissionMessage: string

    acceptingInterests: boolean
  }

  about: {
    history: string

    mission: string

    institutionalText: string

    photoUrls: string[]

    additionalInfo: string
  }

  campaigns: SiteCampaign[]

  account: {
    displayName: string
  }
}

export const SITE_SETTINGS_STORAGE_KEY = "saal.site-settings.v1"

export const defaultSiteSettings: SiteSettings = {
  statistics: {
    historicalRescues: null,

    historicalAdoptions: null,

    startYear: null,

    showRescued: false,

    showAdoptions: false,

    showTreatment: false,

    showStartYear: false,

    showSystemCounts: false,

    historicalUpdatedAt: null,
  },

  home: {
    title: "Ajude um anjo a encontrar um lar",

    subtitle:
      "Cada animal merece uma segunda chance de ser amado. Adote, transforme vidas.",

    presentationText:
      "Conheça o trabalho do SAAL e os animais que estão esperando por uma família.",

    heroImageUrl: "",

    primaryButtonText: "Quero Adotar Agora",

    primaryButtonDestination: "/animais",

    highlightMessage: "",
  },

  contact: {
    phone: "+55 15 99663-1983",

    whatsapp: "+55 15 99663-1983",

    email: "contato@saal.com.br",

    address: "",

    city: "Capão Bonito",

    state: "SP",

    instagram: "https://www.instagram.com/ongsaal",

    facebook: "",

    hours: "Segunda a Sexta, 9h às 18h",
  },

  donations: {
    enabled: false,

    pixKey: "",

    beneficiary: "",

    instructions: "",

    qrCodeUrl: "",

    campaign: "",
  },

  adoption: {
    explanation:
      "Nosso processo é cuidadoso para garantir o bem-estar do animal e a compatibilidade com sua família.",

    requirements: "",

    steps: [
      {
        title: "Escolha o Animal",

        description:
          "Navegue pelo catálogo e encontre o pet que conquistou seu coração.",
      },

      {
        title: "Manifeste Interesse",

        description: "Preencha o formulário com seus dados e conte sobre você.",
      },

      {
        title: "Entrevista",

        description: "Nossa equipe entrará em contato para conhecê-lo melhor.",
      },

      {
        title: "Adote!",

        description:
          "Após aprovação, leve seu novo amigo para casa com muito amor.",
      },
    ],

    faqs: [],

    submissionMessage:
      "Seu interesse foi anotado nesta demonstração. Para dar continuidade, entre em contato com a equipe da ONG.",

    acceptingInterests: true,
  },

  about: {
    history:
      "O Santuário de Animais Anjos da Luz (SAAL) é uma ONG sem fins lucrativos localizada em Capão Bonito - SP, dedicada ao resgate, cuidado e adoção responsável de animais em situação de abandono.",

    mission:
      "Resgatar, proteger e encontrar lares amorosos para animais abandonados, promovendo a adoção responsável e o bem-estar animal em Capão Bonito e região.",

    institutionalText:
      "Nossa missão é proporcionar uma segunda chance para cada animal que chega até nós, oferecendo tratamento veterinário, alimentação adequada e muito amor até encontrarem uma família para sempre.",

    photoUrls: [],

    additionalInfo: "",
  },

  campaigns: [],

  account: {
    displayName: "Administração SAAL",
  },
}

const TEXT_LIMITS = {
  short: 160,

  medium: 500,

  long: 3000,
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPlainText(
  value: unknown,
  limit: number,
  allowEmpty = true,
): value is string {
  const hasControlCharacters =
    typeof value === "string" &&
    [...value].some((character) => {
      const codePoint = character.codePointAt(0)!

      return (
        codePoint <= 0x08 ||
        (codePoint >= 0x0b && codePoint <= 0x0c) ||
        (codePoint >= 0x0e && codePoint <= 0x1f)
      )
    })

  return (
    typeof value === "string" &&
    value.length <= limit &&
    (allowEmpty || value.trim().length > 0) &&
    !/[<>]/.test(value) &&
    !hasControlCharacters
  )
}

function isOptionalCount(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" && Number.isSafeInteger(value) && value >= 0)
  )
}

function isOptionalYear(value: unknown): value is number | null {
  const currentYear = new Date().getFullYear()

  return (
    value === null ||
    (typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 1900 &&
      value <= currentYear)
  )
}

function isOptionalDate(value: unknown): value is string | null {
  if (value === null) return true

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00Z`)

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

function isOptionalHttpsUrl(value: unknown): value is string {
  if (value === "") return true

  if (typeof value !== "string" || value.length > 2048) return false

  try {
    const url = new URL(value)

    return url.protocol === "https:" && !url.username && !url.password
  } catch {
    return false
  }
}

function isOptionalSocialUrl(
  value: unknown,

  allowedHosts: readonly string[],
): value is string {
  if (value === "") return true

  if (!isOptionalHttpsUrl(value)) return false

  return allowedHosts.includes(new URL(value).hostname.toLowerCase())
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

function isAdoptionStep(value: unknown): value is AdoptionStep {
  return (
    isRecord(value) &&
    isPlainText(value.title, TEXT_LIMITS.short, false) &&
    isPlainText(value.description, TEXT_LIMITS.medium, false)
  )
}

function isAdoptionQuestion(value: unknown): value is AdoptionQuestion {
  return (
    isRecord(value) &&
    isPlainText(value.question, TEXT_LIMITS.short, false) &&
    isPlainText(value.answer, TEXT_LIMITS.medium, false)
  )
}

function isCampaign(value: unknown): value is SiteCampaign {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 100 &&
    (value.type === "campanha" ||
      value.type === "aviso" ||
      value.type === "feira" ||
      value.type === "evento") &&
    isPlainText(value.title, TEXT_LIMITS.short, false) &&
    isPlainText(value.description, TEXT_LIMITS.medium) &&
    isOptionalDate(value.startDate) &&
    isOptionalDate(value.endDate) &&
    (!value.startDate || !value.endDate || value.startDate <= value.endDate) &&
    isOptionalHttpsUrl(value.imageUrl) &&
    isBoolean(value.visible)
  )
}

export function isSiteSettings(value: unknown): value is SiteSettings {
  if (!isRecord(value)) return false

  const {
    statistics,
    home,
    contact,
    donations,
    adoption,
    about,
    campaigns,
    account,
  } = value

  if (
    !isRecord(statistics) ||
    !isRecord(home) ||
    !isRecord(contact) ||
    !isRecord(donations) ||
    !isRecord(adoption) ||
    !isRecord(about) ||
    !isRecord(account) ||
    !Array.isArray(campaigns)
  ) {
    return false
  }

  const digitsOnlyPhone = (phone: unknown) =>
    typeof phone === "string" &&
    phone.length <= 32 &&
    /^[+\d\s().-]*$/.test(phone) &&
    (phone === "" || phone.replace(/\D/g, "").length >= 10)

  return (
    isOptionalCount(statistics.historicalRescues) &&
    isOptionalCount(statistics.historicalAdoptions) &&
    isOptionalYear(statistics.startYear) &&
    isBoolean(statistics.showRescued) &&
    isBoolean(statistics.showAdoptions) &&
    isBoolean(statistics.showTreatment) &&
    isBoolean(statistics.showStartYear) &&
    isBoolean(statistics.showSystemCounts) &&
    isOptionalDate(statistics.historicalUpdatedAt) &&
    isPlainText(home.title, TEXT_LIMITS.short, false) &&
    isPlainText(home.subtitle, TEXT_LIMITS.medium, false) &&
    isPlainText(home.presentationText, TEXT_LIMITS.long) &&
    isOptionalHttpsUrl(home.heroImageUrl) &&
    isPlainText(home.primaryButtonText, TEXT_LIMITS.short, false) &&
    (home.primaryButtonDestination === "/animais" ||
      home.primaryButtonDestination === "/contato" ||
      home.primaryButtonDestination === "/#doacoes") &&
    isPlainText(home.highlightMessage, TEXT_LIMITS.medium) &&
    digitsOnlyPhone(contact.phone) &&
    digitsOnlyPhone(contact.whatsapp) &&
    isPlainText(contact.email, 254) &&
    (contact.email === "" ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) &&
    isPlainText(contact.address, TEXT_LIMITS.medium) &&
    isPlainText(contact.city, TEXT_LIMITS.short) &&
    isPlainText(contact.state, 2) &&
    (contact.state === "" || /^[a-z]{2}$/i.test(contact.state)) &&
    isOptionalSocialUrl(contact.instagram, [
      "instagram.com",

      "www.instagram.com",
    ]) &&
    isOptionalSocialUrl(contact.facebook, [
      "facebook.com",

      "www.facebook.com",

      "fb.com",

      "www.fb.com",
    ]) &&
    isPlainText(contact.hours, TEXT_LIMITS.medium) &&
    isBoolean(donations.enabled) &&
    isPlainText(donations.pixKey, TEXT_LIMITS.short) &&
    isPlainText(donations.beneficiary, TEXT_LIMITS.short) &&
    isPlainText(donations.instructions, TEXT_LIMITS.long) &&
    isOptionalHttpsUrl(donations.qrCodeUrl) &&
    isPlainText(donations.campaign, TEXT_LIMITS.medium) &&
    isPlainText(adoption.explanation, TEXT_LIMITS.long) &&
    isPlainText(adoption.requirements, TEXT_LIMITS.long) &&
    Array.isArray(adoption.steps) &&
    adoption.steps.length <= 8 &&
    adoption.steps.every(isAdoptionStep) &&
    Array.isArray(adoption.faqs) &&
    adoption.faqs.length <= 15 &&
    adoption.faqs.every(isAdoptionQuestion) &&
    isPlainText(adoption.submissionMessage, TEXT_LIMITS.long, false) &&
    isBoolean(adoption.acceptingInterests) &&
    isPlainText(about.history, TEXT_LIMITS.long) &&
    isPlainText(about.mission, TEXT_LIMITS.long) &&
    isPlainText(about.institutionalText, TEXT_LIMITS.long) &&
    Array.isArray(about.photoUrls) &&
    about.photoUrls.length <= 8 &&
    about.photoUrls.every(isOptionalHttpsUrl) &&
    isPlainText(about.additionalInfo, TEXT_LIMITS.long) &&
    campaigns.length <= 20 &&
    campaigns.every(isCampaign) &&
    isPlainText(account.displayName, TEXT_LIMITS.short, false)
  )
}

export function loadSiteSettings(
  storage: Pick<Storage, "getItem">,
): SiteSettings {
  const savedSettings = storage.getItem(SITE_SETTINGS_STORAGE_KEY)

  if (savedSettings === null) return defaultSiteSettings

  const parsedSettings: unknown = JSON.parse(savedSettings)

  if (!isSiteSettings(parsedSettings)) {
    throw new Error("Saved site settings are invalid.")
  }

  return parsedSettings
}

export function saveSiteSettings(
  storage: Pick<Storage, "setItem">,

  settings: SiteSettings,
): void {
  if (!isSiteSettings(settings)) {
    throw new Error("Site settings are invalid.")
  }

  storage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function getCurrentAnimalCounts(animals: Animal[]) {
  return {
    registered: animals.length,

    available: animals.filter((animal) => animal.status === "available").length,

    adopted: animals.filter((animal) => animal.status === "adopted").length,

    treatment: animals.filter((animal) => animal.status === "treatment").length,
  }
}

export function getHistoricalImpactTotals(
  statistics: SiteSettings["statistics"],

  animals: Animal[],
) {
  const counts = getCurrentAnimalCounts(animals)

  return {
    rescued: (statistics.historicalRescues ?? 0) + counts.registered,

    adoptions: (statistics.historicalAdoptions ?? 0) + counts.adopted,
  }
}

export function getActiveCampaigns(
  campaigns: SiteCampaign[],

  today = (() => {
    const now = new Date()

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  })(),
): SiteCampaign[] {
  return campaigns.filter(
    (campaign) =>
      campaign.visible &&
      (!campaign.startDate || campaign.startDate <= today) &&
      (!campaign.endDate || campaign.endDate >= today),
  )
}
