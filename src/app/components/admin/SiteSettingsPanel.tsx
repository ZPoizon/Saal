import { useEffect, useMemo, useRef, useState } from "react"

import { useBlocker } from "react-router"

import { toast } from "sonner"

import { useConfirm } from "../ui/confirm"

import {
  CalendarDays,
  EyeOff,
  Globe,
  Heart,
  House,
  Megaphone,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react"

import { useSiteSettings } from "../../contexts/SiteSettingsContext"

import type { Animal } from "../../data/animals"

import {
  getCurrentAnimalCounts,
  isSiteSettings,
  type AdoptionQuestion,
  type AdoptionStep,
  type CampaignType,
  type SiteCampaign,
  type SiteSettings,
} from "../../data/siteSettings"

type SettingsTab = "statistics" | "home" | "contact" | "donations" | "adoption" | "about" | "campaigns" | "account"

interface SettingsTabConfig {
  id: SettingsTab

  label: string

  icon: typeof House
}

interface FieldProps {
  label: string

  id: string

  value: string | number

  onChange: (value: string) => void

  type?: string

  required?: boolean

  maxLength?: number

  placeholder?: string

  help?: string

  min?: number | string

  max?: number | string
}

interface TextAreaProps {
  label: string

  id: string

  value: string

  onChange: (value: string) => void

  required?: boolean

  maxLength?: number

  rows?: number

  help?: string

  placeholder?: string
}

interface ToggleProps {
  id: string

  label: string

  checked: boolean

  onChange: (checked: boolean) => void

  description?: string
}

interface SectionHeadingProps {
  title: string

  description: string
}

interface SiteSettingsPanelProps {
  onLogout: () => void

  onDirtyChange: (dirty: boolean) => void

  animals: Animal[]
}

const tabs: SettingsTabConfig[] = [
  { id: "statistics", label: "Estatísticas", icon: Users },

  { id: "home", label: "Página Inicial", icon: House },

  { id: "contact", label: "Contato", icon: Phone },

  { id: "donations", label: "Doações", icon: Heart },

  { id: "adoption", label: "Adoção", icon: CalendarDays },

  { id: "about", label: "Sobre a ONG", icon: Globe },

  { id: "campaigns", label: "Campanhas e Avisos", icon: Megaphone },

  { id: "account", label: "Minha Conta", icon: ShieldCheck },
]

const fieldClass =
  "min-h-12 w-full rounded-lg border border-[#d8e5df] bg-[#F5EFE6] px-4 py-3 text-[#2E7D6B] focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"

const textAreaClass = `${fieldClass} min-h-28 resize-y`

function isValidHttpsUrl(value: string) {
  if (!value) return true

  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

function Field({
  label,

  id,

  value,

  onChange,

  type = "text",

  required = false,

  maxLength,

  placeholder,

  help,

  min,

  max,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[#2E7D6B]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        step={type === "number" ? "1" : undefined}
        placeholder={placeholder}
        className={fieldClass}
      />
      {help && <p className="text-xs leading-relaxed text-gray-500">{help}</p>}
    </div>
  )
}

function TextArea({
  label,

  id,

  value,

  onChange,

  required = false,

  maxLength = 3000,

  rows = 4,

  help,

  placeholder,
}: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[#2E7D6B]"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        className={textAreaClass}
      />
      {help && <p className="text-xs leading-relaxed text-gray-500">{help}</p>}
      <p className="text-right text-xs text-gray-400">
        {value.length}/{maxLength}
      </p>
    </div>
  )
}

function Toggle({
  id,

  label,

  checked,

  onChange,

  description,
}: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-[#d8e5df] bg-white p-4"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[#2E7D6B]"
      />
      <span>
        <span className="block font-medium text-[#2E7D6B]">{label}</span>
        {description && (
          <span className="mt-1 block text-sm text-gray-500">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

function SectionHeading({
  title,

  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-[#2E7D6B]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-[#527f74]">
        {description}
      </p>
    </div>
  )
}

export function SiteSettingsPanel({
  onLogout,

  onDirtyChange,

  animals,
}: SiteSettingsPanelProps) {
  const { settings, saveSettings, storageError } = useSiteSettings()

  const confirm = useConfirm()

  const [draft, setDraft] = useState<SiteSettings>(settings)

  const [activeTab, setActiveTab] = useState<SettingsTab>("statistics")

  const [message, setMessage] = useState("")

  const [saving, setSaving] = useState(false)

  const [validationError, setValidationError] = useState("")

  const formRef = useRef<HTMLFormElement>(null)

  const previousSettings = useRef(settings)

  const currentIsDirty = useMemo(
    () =>
      JSON.stringify(draft[activeTab]) !== JSON.stringify(settings[activeTab]),

    [activeTab, draft, settings],
  )

  const hasUnsavedChanges = useMemo(
    () =>
      tabs.some(
        ({ id }) =>
          id !== "account" &&
          JSON.stringify(draft[id]) !== JSON.stringify(settings[id]),
      ),

    [draft, settings],
  )

  const animalCounts = getCurrentAnimalCounts(animals)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    const previous = previousSettings.current

    setDraft((current) => {
      const next = { ...current }

      const syncSection = <K extends SettingsTab>(section: K) => {
        if (
          JSON.stringify(current[section]) === JSON.stringify(previous[section])
        ) {
          next[section] = settings[section]
        }
      }

      for (const { id } of tabs) syncSection(id)

      return next
    })

    previousSettings.current = settings
  }, [settings])

  useEffect(() => {
    onDirtyChange(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return

      event.preventDefault()

      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (blocker.state !== "blocked") return

    void confirm({
      title: "Descartar alterações?",
      description:
        "Você possui alterações que ainda não foram salvas. Deseja sair sem salvar?",
      confirmLabel: "Descartar alterações",
      cancelLabel: "Continuar editando",
      variant: "warning",
    }).then((discard) => {
      if (discard) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    })
  }, [blocker, confirm])

  const updateSection = <K extends SettingsTab,>(
    section: K,

    value: SiteSettings[K],
  ) => {
    setDraft((current) => ({ ...current, [section]: value }))

    setMessage("")

    setValidationError("")
  }

  const chooseTab = async (nextTab: SettingsTab): Promise<boolean> => {
    if (nextTab === activeTab) return false

    if (currentIsDirty) {
      const discard = await confirm({
        title: "Descartar alterações?",
        description:
          "Você possui alterações que ainda não foram salvas nesta aba. Deseja sair sem salvar?",
        confirmLabel: "Descartar alterações",
        cancelLabel: "Continuar editando",
        variant: "warning",
      })

      if (!discard) return false
    }

    setDraft((current) => ({ ...current, [activeTab]: settings[activeTab] }))

    setActiveTab(nextTab)

    setMessage("")

    setValidationError("")

    return true
  }

  const discardChanges = async () => {
    if (currentIsDirty) {
      const discard = await confirm({
        title: "Descartar alterações?",
        description:
          "Você possui alterações que ainda não foram salvas nesta aba. Deseja descartá-las?",
        confirmLabel: "Descartar alterações",
        cancelLabel: "Continuar editando",
        variant: "warning",
      })

      if (!discard) return
    }

    setDraft((current) => ({ ...current, [activeTab]: settings[activeTab] }))

    setMessage("Alterações descartadas.")

    setValidationError("")
  }

  const saveCurrentTab = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setMessage("")

    setValidationError("")

    if (!formRef.current?.reportValidity()) return

    if (activeTab === "donations" && draft.donations.enabled) {
      if (
        !draft.donations.pixKey.trim() ||
        !draft.donations.beneficiary.trim()
      ) {
        setValidationError(
          "Informe a chave PIX e o nome público do beneficiário para ativar doações.",
        )

        return
      }
    }

    if (
      activeTab === "contact" &&
      !isValidHttpsUrl(draft.contact.instagram) &&
      draft.contact.instagram
    ) {
      setValidationError("Use um endereço HTTPS válido para o Instagram.")

      return
    }

    if (
      activeTab === "contact" &&
      draft.contact.instagram &&
      !["instagram.com", "www.instagram.com"].includes(
        new URL(draft.contact.instagram).hostname.toLowerCase(),
      )
    ) {
      setValidationError("Informe uma URL oficial do Instagram.")

      return
    }

    if (
      activeTab === "contact" &&
      !isValidHttpsUrl(draft.contact.facebook) &&
      draft.contact.facebook
    ) {
      setValidationError("Use um endereço HTTPS válido para o Facebook.")

      return
    }

    if (
      activeTab === "contact" &&
      draft.contact.facebook &&
      !["facebook.com", "www.facebook.com", "fb.com", "www.fb.com"].includes(
        new URL(draft.contact.facebook).hostname.toLowerCase(),
      )
    ) {
      setValidationError("Informe uma URL oficial do Facebook.")

      return
    }

    if (
      activeTab === "campaigns" &&
      draft.campaigns.some(
        (campaign) =>
          campaign.startDate &&
          campaign.endDate &&
          campaign.startDate > campaign.endDate,
      )
    ) {
      setValidationError(
        "A data de término de cada campanha deve ser igual ou posterior à data de início.",
      )

      return
    }

    if (activeTab === "adoption" && !draft.adoption.acceptingInterests) {
      if (settings.adoption.acceptingInterests) {
        const pause = await confirm({
          title: "Pausar interesses?",
          description:
            "Pausar o recebimento de novos interesses? O bloqueio vale apenas para este navegador.",
          confirmLabel: "Pausar",
          cancelLabel: "Manter aberto",
          variant: "warning",
        })

        if (!pause) return
      }
    }

    let updatedSection: SiteSettings[SettingsTab] = draft[activeTab]

    if (activeTab === "statistics") {
      const historicalChanged =
        draft.statistics.historicalRescues !==
          settings.statistics.historicalRescues ||
        draft.statistics.historicalAdoptions !==
          settings.statistics.historicalAdoptions ||
        draft.statistics.startYear !== settings.statistics.startYear

      updatedSection = {
        ...draft.statistics,

        historicalUpdatedAt: historicalChanged
          ? new Date().toISOString().slice(0, 10)
          : settings.statistics.historicalUpdatedAt,
      }
    }

    setSaving(true)

    const nextSettings = { ...settings, [activeTab]: updatedSection }

    if (!isSiteSettings(nextSettings)) {
      setSaving(false)

      setValidationError(
        "Revise os campos desta aba: remova HTML, confirme números, endereços e datas válidos.",
      )

      return
    }

    const saved = await saveSettings(nextSettings)

    setSaving(false)

    if (saved) {
      setDraft((current) => ({ ...current, [activeTab]: updatedSection }))

      toast.success("Alterações salvas.")
    }
  }

  const changeStatistics = (
    key: keyof SiteSettings["statistics"],

    value: SiteSettings["statistics"][typeof key],
  ) =>
    updateSection("statistics", {
      ...draft.statistics,

      [key]: value,
    } as SiteSettings["statistics"])

  const changeHome = (key: keyof SiteSettings["home"], value: string) =>
    updateSection("home", {
      ...draft.home,

      [key]: value,
    } as SiteSettings["home"])

  const changeContact = (key: keyof SiteSettings["contact"], value: string) =>
    updateSection("contact", {
      ...draft.contact,

      [key]: value,
    } as SiteSettings["contact"])

  const changeDonations = (
    key: keyof SiteSettings["donations"],

    value: string | boolean,
  ) =>
    updateSection("donations", {
      ...draft.donations,

      [key]: value,
    } as SiteSettings["donations"])

  const changeAdoption = (
    key: keyof SiteSettings["adoption"],

    value: string | boolean | AdoptionStep[] | AdoptionQuestion[],
  ) =>
    updateSection("adoption", {
      ...draft.adoption,

      [key]: value,
    } as SiteSettings["adoption"])

  const changeAbout = (
    key: keyof SiteSettings["about"],

    value: string | string[],
  ) =>
    updateSection("about", {
      ...draft.about,

      [key]: value,
    } as SiteSettings["about"])

  const updateCampaign = (
    id: string,

    key: keyof SiteCampaign,

    value: string | boolean | CampaignType,
  ) =>
    updateSection(
      "campaigns",

      draft.campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, [key]: value } : campaign,
      ),
    )

  const addCampaign = () =>
    updateSection("campaigns", [
      ...draft.campaigns,

      {
        id: `campaign-${Date.now()}`,

        type: "campanha",

        title: "",

        description: "",

        startDate: "",

        endDate: "",

        imageUrl: "",

        visible: false,
      },
    ])

  const removeCampaign = (id: string) => {
    void confirm({
      title: "Remover campanha?",
      description:
        "A campanha será removida da lista atual. A alteração só é registrada ao salvar as configurações.",
      confirmLabel: "Remover",
      cancelLabel: "Manter",
      variant: "warning",
    }).then((remove) => {
      if (!remove) return

      updateSection(
        "campaigns",

        draft.campaigns.filter((campaign) => campaign.id !== id),
      )
    })
  }

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab)!

  const ActiveIcon = activeTabConfig.icon

  return (
    <section
      aria-labelledby="site-settings-heading"
      className="mb-8 overflow-hidden rounded-2xl bg-white shadow-md"
    >
      <div className="border-b border-[#e6eee9] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[#2E7D6B]/10 p-3 text-[#2E7D6B]">
            <Globe size={22} />
          </div>
          <div>
            <h2
              id="site-settings-heading"
              className="text-2xl font-bold text-[#2E7D6B]"
            >
              Configuração
            </h2>
          </div>
        </div>
      </div>

      <nav
        aria-label="Abas de configurações do site"
        className="overflow-x-auto border-b border-[#e6eee9]"
      >
        <div
          role="tablist"
          aria-label="Configuração"
          className="flex min-w-max gap-1 px-3 py-2 sm:px-5"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`site-settings-tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls="site-settings-tabpanel"
              onClick={() => void chooseTab(id)}
              onKeyDown={(event) => {
                if (
                  event.key !== "ArrowRight" &&
                  event.key !== "ArrowLeft" &&
                  event.key !== "Home" &&
                  event.key !== "End"
                ) {
                  return
                }

                event.preventDefault()

                const currentIndex = tabs.findIndex((tab) => tab.id === id)

                const nextIndex =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : (currentIndex +
                          (event.key === "ArrowRight" ? 1 : -1) +
                          tabs.length) %
                        tabs.length

                const nextTab = tabs[nextIndex]!

                void chooseTab(nextTab.id).then((switched) => {
                  if (switched) {
                    document
                      .getElementById(`site-settings-tab-${nextTab.id}`)

                      ?.focus()
                  }
                })
              }}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4B04A] ${
                activeTab === id
                  ? "bg-[#2E7D6B] text-white"
                  : "text-[#2E7D6B] hover:bg-[#F5EFE6]"
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
              {id !== "account" &&
                JSON.stringify(draft[id]) !== JSON.stringify(settings[id]) && (
                  <span
                    className="h-2 w-2 rounded-full bg-[#E4B04A]"
                    aria-label="Alterações não salvas"
                  />
                )}
            </button>
          ))}
        </div>
      </nav>

      <form
        ref={formRef}
        onSubmit={saveCurrentTab}
        role="tabpanel"
        id="site-settings-tabpanel"
        aria-labelledby={`site-settings-tab-${activeTab}`}
        className="p-5 sm:p-6"
      >
        <div className="mb-6 flex items-center gap-2 text-[#2E7D6B]">
          <ActiveIcon size={20} aria-hidden="true" />
          <h3 className="text-lg font-bold">{activeTabConfig.label}</h3>
          {currentIsDirty && (
            <span className="ml-auto rounded-full bg-[#E4B04A]/15 px-3 py-1 text-xs font-medium text-[#8a641b]">
              Alterações não salvas
            </span>
          )}
        </div>

        {storageError && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {storageError}
          </p>
        )}
        {validationError && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {validationError}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-[#2E7D6B]/20 bg-[#2E7D6B]/5 p-3 text-sm text-[#2E7D6B]"
          >
            {message}
          </p>
        )}

        {activeTab === "statistics" && (
          <div className="space-y-8">
            <div className="rounded-xl border border-[#E4B04A]/40 bg-[#E4B04A]/10 p-4 text-sm leading-relaxed text-[#6b5425]">
              Os números históricos começam vazios e ocultos porque ainda não
              foram confirmados. Os contadores automáticos refletem os registros
              de animais guardados neste navegador; o catálogo inicial contém
              exemplos.
            </div>
            <div>
              <SectionHeading
                title="Números anteriores ao sistema"
                description="Informe somente números históricos confirmados pela ONG. O sistema soma os registros atuais sem duplicar os campos históricos."
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field
                  id="historical-rescues"
                  label="Resgates antes do sistema"
                  type="number"
                  min="0"
                  value={draft.statistics.historicalRescues ?? ""}
                  onChange={(value) =>
                    changeStatistics(
                      "historicalRescues",

                      value === "" ? null : Number(value),
                    )
                  }
                  help="Esse total será somado aos animais cadastrados no catálogo."
                />
                <Field
                  id="historical-adoptions"
                  label="Adoções antes do sistema"
                  type="number"
                  min="0"
                  value={draft.statistics.historicalAdoptions ?? ""}
                  onChange={(value) =>
                    changeStatistics(
                      "historicalAdoptions",

                      value === "" ? null : Number(value),
                    )
                  }
                  help="Esse total será somado aos animais marcados como adotados."
                />
                <Field
                  id="organization-start-year"
                  label="Ano de início das atividades"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={draft.statistics.startYear ?? ""}
                  onChange={(value) =>
                    changeStatistics(
                      "startYear",

                      value === "" ? null : Number(value),
                    )
                  }
                />
              </div>
            </div>
            <div>
              <SectionHeading
                title="Exibição pública"
                description="Contadores históricos e automáticos são desligados por padrão. Ative apenas os números que a ONG autorizou divulgar."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  id="show-rescued"
                  label="Exibir animais resgatados"
                  checked={draft.statistics.showRescued}
                  onChange={(checked) =>
                    changeStatistics("showRescued", checked)
                  }
                  description={`Histórico + ${animalCounts.registered} registros do catálogo`}
                />
                <Toggle
                  id="show-adoptions"
                  label="Exibir adoções realizadas"
                  checked={draft.statistics.showAdoptions}
                  onChange={(checked) =>
                    changeStatistics("showAdoptions", checked)
                  }
                  description={`Histórico + ${animalCounts.adopted} registros marcados como adotados`}
                />
                <Toggle
                  id="show-start-year"
                  label="Exibir ano de início"
                  checked={draft.statistics.showStartYear}
                  onChange={(checked) =>
                    changeStatistics("showStartYear", checked)
                  }
                />
                <Toggle
                  id="show-system-counts"
                  label="Exibir resumo do catálogo"
                  checked={draft.statistics.showSystemCounts}
                  onChange={(checked) =>
                    changeStatistics("showSystemCounts", checked)
                  }
                  description={`Cadastrados: ${animalCounts.registered}; disponíveis: ${animalCounts.available}; adotados: ${animalCounts.adopted}`}
                />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Última atualização dos números históricos:{" "}
                {draft.statistics.historicalUpdatedAt
                  ? new Date(
                      `${draft.statistics.historicalUpdatedAt}T00:00:00`,
                    ).toLocaleDateString("pt-BR")
                  : "ainda não informada"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "home" && (
          <div className="space-y-5">
            <SectionHeading
              title="Conteúdo de destaque"
              description="Use texto simples. A prévia abaixo acompanha as alterações e não executa HTML, scripts ou estilos."
            />
            <Field
              id="home-title"
              label="Título principal"
              value={draft.home.title}
              onChange={(value) => changeHome("title", value)}
              required
              maxLength={160}
            />
            <TextArea
              id="home-subtitle"
              label="Subtítulo"
              value={draft.home.subtitle}
              onChange={(value) => changeHome("subtitle", value)}
              required
              maxLength={500}
              rows={2}
            />
            <TextArea
              id="home-presentation"
              label="Texto de apresentação"
              value={draft.home.presentationText}
              onChange={(value) => changeHome("presentationText", value)}
              maxLength={3000}
            />
            <Field
              id="home-image"
              label="Imagem de destaque (URL HTTPS)"
              type="url"
              value={draft.home.heroImageUrl}
              onChange={(value) => changeHome("heroImageUrl", value)}
              placeholder="https://..."
              help="A imagem deve usar HTTPS. Deixe vazio para manter o fundo em degradê atual."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="home-primary-button"
                label="Texto do botão principal"
                value={draft.home.primaryButtonText}
                onChange={(value) => changeHome("primaryButtonText", value)}
                required
                maxLength={80}
              />
              <div className="space-y-1.5">
                <label
                  htmlFor="home-button-destination"
                  className="block text-sm font-semibold text-[#2E7D6B]"
                >
                  Destino do botão
                </label>
                <select
                  id="home-button-destination"
                  value={draft.home.primaryButtonDestination}
                  onChange={(event) =>
                    changeHome(
                      "primaryButtonDestination",

                      event.target.value,
                    )
                  }
                  className={fieldClass}
                >
                  <option value="/animais">Catálogo de animais</option>
                  <option value="/contato">Página de contato</option>
                  <option value="/#doacoes">Seção de doações</option>
                </select>
              </div>
            </div>
            <TextArea
              id="home-highlight"
              label="Mensagem de destaque (opcional)"
              value={draft.home.highlightMessage}
              onChange={(value) => changeHome("highlightMessage", value)}
              maxLength={500}
              rows={2}
            />
            <div className="rounded-2xl bg-gradient-to-br from-[#2E7D6B] to-[#6FAE9C] p-6 text-center text-white">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/75">
                Pré-visualização
              </p>
              {draft.home.heroImageUrl &&
                isValidHttpsUrl(draft.home.heroImageUrl) && (
                  <img
                    src={draft.home.heroImageUrl}
                    alt="Prévia da imagem de destaque"
                    className="mx-auto mb-4 max-h-40 w-full rounded-xl object-cover"
                  />
                )}
              {draft.home.highlightMessage && (
                <p className="mb-3 text-sm text-[#F5EFE6]">
                  {draft.home.highlightMessage}
                </p>
              )}
              <p className="text-2xl font-bold">{draft.home.title}</p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#F5EFE6]">
                {draft.home.subtitle}
              </p>
              <span className="mt-4 inline-flex rounded-full bg-[#E4B04A] px-5 py-3 font-semibold">
                {draft.home.primaryButtonText}
              </span>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="contact-phone"
              label="Telefone"
              type="tel"
              value={draft.contact.phone}
              onChange={(value) => changeContact("phone", value)}
              placeholder="+55 15 99999-9999"
              maxLength={32}
            />
            <Field
              id="contact-whatsapp"
              label="WhatsApp"
              type="tel"
              value={draft.contact.whatsapp}
              onChange={(value) => changeContact("whatsapp", value)}
              placeholder="+55 15 99999-9999"
              maxLength={32}
              help="O link público usa formato internacional com código do país."
            />
            <Field
              id="contact-email"
              label="E-mail público"
              type="email"
              value={draft.contact.email}
              onChange={(value) => changeContact("email", value)}
              maxLength={254}
            />
            <Field
              id="contact-address"
              label="Endereço público"
              value={draft.contact.address}
              onChange={(value) => changeContact("address", value)}
              maxLength={500}
              help="Não informe endereço residencial sem autorização expressa."
            />
            <Field
              id="contact-city"
              label="Cidade"
              value={draft.contact.city}
              onChange={(value) => changeContact("city", value)}
              maxLength={160}
            />
            <Field
              id="contact-state"
              label="Estado (UF)"
              value={draft.contact.state}
              onChange={(value) => changeContact("state", value.toUpperCase())}
              maxLength={2}
            />
            <Field
              id="contact-instagram"
              label="Instagram (URL HTTPS)"
              type="url"
              value={draft.contact.instagram}
              onChange={(value) => changeContact("instagram", value)}
              placeholder="https://www.instagram.com/..."
            />
            <Field
              id="contact-facebook"
              label="Facebook (URL HTTPS)"
              type="url"
              value={draft.contact.facebook}
              onChange={(value) => changeContact("facebook", value)}
              placeholder="https://www.facebook.com/..."
            />
            <div className="sm:col-span-2">
              <TextArea
                id="contact-hours"
                label="Horário de atendimento"
                value={draft.contact.hours}
                onChange={(value) => changeContact("hours", value)}
                maxLength={500}
                rows={2}
              />
            </div>
            <p className="sm:col-span-2 text-sm text-gray-500">
              Links de telefone, WhatsApp e e-mail são gerados a partir destes
              campos; redes sociais só aceitam endereços HTTPS.
            </p>
          </div>
        )}

        {activeTab === "donations" && (
          <div className="space-y-5">
            <p className="rounded-xl bg-[#F5EFE6] p-4 text-sm text-[#527f74]">
              Esta aba apenas publica instruções e a chave PIX. Não processa
              pagamentos nem confirma transferências.
            </p>
            <Toggle
              id="donations-enabled"
              label="Exibir seção de doações"
              checked={draft.donations.enabled}
              onChange={(checked) => changeDonations("enabled", checked)}
              description="Para ativar, informe a chave PIX e o nome público do beneficiário."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="pix-key"
                label="Chave PIX"
                value={draft.donations.pixKey}
                onChange={(value) => changeDonations("pixKey", value)}
                maxLength={160}
              />
              <Field
                id="pix-beneficiary"
                label="Nome público do beneficiário"
                value={draft.donations.beneficiary}
                onChange={(value) => changeDonations("beneficiary", value)}
                maxLength={160}
              />
              <Field
                id="donation-qr"
                label="QR Code PIX (URL HTTPS)"
                type="url"
                value={draft.donations.qrCodeUrl}
                onChange={(value) => changeDonations("qrCodeUrl", value)}
                placeholder="https://..."
              />
              <Field
                id="donation-campaign"
                label="Campanha de arrecadação em destaque"
                value={draft.donations.campaign}
                onChange={(value) => changeDonations("campaign", value)}
                maxLength={500}
              />
            </div>
            <TextArea
              id="donation-instructions"
              label="Instruções para doação"
              value={draft.donations.instructions}
              onChange={(value) => changeDonations("instructions", value)}
              maxLength={3000}
            />
          </div>
        )}

        {activeTab === "adoption" && (
          <div className="space-y-8">
            <Toggle
              id="accept-interests"
              label="Receber novas manifestações de interesse"
              checked={draft.adoption.acceptingInterests}
              onChange={(checked) =>
                changeAdoption("acceptingInterests", checked)
              }
              description="Desativar bloqueia o formulário. Sem API, não existe bloqueio no servidor."
            />
            <TextArea
              id="adoption-explanation"
              label="Texto explicativo do processo"
              value={draft.adoption.explanation}
              onChange={(value) => changeAdoption("explanation", value)}
              maxLength={3000}
            />
            <TextArea
              id="adoption-requirements"
              label="Requisitos e orientações"
              value={draft.adoption.requirements}
              onChange={(value) => changeAdoption("requirements", value)}
              maxLength={3000}
              help="Uma orientação por linha. Não inclua dados pessoais."
            />
            <div>
              <SectionHeading
                title="Etapas do processo"
                description="A ordem da lista define a ordem exibida na página inicial."
              />
              <div className="space-y-4">
                {draft.adoption.steps.map((step, index) => (
                  <div
                    key={`step-${index}`}
                    className="grid gap-3 rounded-xl border border-[#d8e5df] p-4 sm:grid-cols-[1fr_2fr_auto]"
                  >
                    <Field
                      id={`adoption-step-title-${index}`}
                      label={`Etapa ${index + 1}`}
                      value={step.title}
                      required
                      maxLength={160}
                      onChange={(title) =>
                        changeAdoption(
                          "steps",

                          draft.adoption.steps.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, title } : item,
                          ),
                        )
                      }
                    />
                    <Field
                      id={`adoption-step-description-${index}`}
                      label="Orientação"
                      value={step.description}
                      required
                      maxLength={500}
                      onChange={(description) =>
                        changeAdoption(
                          "steps",

                          draft.adoption.steps.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, description }
                              : item,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label={`Remover etapa ${index + 1}`}
                      onClick={() =>
                        changeAdoption(
                          "steps",

                          draft.adoption.steps.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      className="mt-6 min-h-12 rounded-lg p-3 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={draft.adoption.steps.length >= 8}
                  onClick={() =>
                    changeAdoption("steps", [
                      ...draft.adoption.steps,

                      { title: "", description: "" },
                    ])
                  }
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#2E7D6B] px-4 font-semibold text-[#2E7D6B] disabled:opacity-50"
                >
                  <Plus size={18} /> Adicionar etapa
                </button>
              </div>
            </div>
            <div>
              <SectionHeading
                title="Perguntas frequentes"
                description="As respostas serão exibidas como texto simples na página inicial."
              />
              <div className="space-y-4">
                {draft.adoption.faqs.map((faq, index) => (
                  <div
                    key={`faq-${index}`}
                    className="grid gap-3 rounded-xl border border-[#d8e5df] p-4 sm:grid-cols-2"
                  >
                    <Field
                      id={`adoption-faq-question-${index}`}
                      label="Pergunta"
                      value={faq.question}
                      required
                      maxLength={160}
                      onChange={(question) =>
                        changeAdoption(
                          "faqs",

                          draft.adoption.faqs.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, question } : item,
                          ),
                        )
                      }
                    />
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Field
                          id={`adoption-faq-answer-${index}`}
                          label="Resposta"
                          value={faq.answer}
                          required
                          maxLength={500}
                          onChange={(answer) =>
                            changeAdoption(
                              "faqs",

                              draft.adoption.faqs.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, answer }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remover pergunta ${index + 1}`}
                        onClick={() =>
                          changeAdoption(
                            "faqs",

                            draft.adoption.faqs.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        className="mb-0.5 min-h-12 rounded-lg p-3 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={draft.adoption.faqs.length >= 15}
                  onClick={() =>
                    changeAdoption("faqs", [
                      ...draft.adoption.faqs,

                      { question: "", answer: "" },
                    ])
                  }
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#2E7D6B] px-4 font-semibold text-[#2E7D6B] disabled:opacity-50"
                >
                  <Plus size={18} /> Adicionar pergunta
                </button>
              </div>
            </div>
            <TextArea
              id="interest-success-message"
              label="Mensagem após envio de interesse"
              value={draft.adoption.submissionMessage}
              onChange={(value) => changeAdoption("submissionMessage", value)}
              required
              maxLength={3000}
            />
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-5">
            <TextArea
              id="about-history"
              label="História da organização"
              value={draft.about.history}
              onChange={(value) => changeAbout("history", value)}
              maxLength={3000}
            />
            <TextArea
              id="about-mission"
              label="Missão e objetivos"
              value={draft.about.mission}
              onChange={(value) => changeAbout("mission", value)}
              maxLength={3000}
            />
            <TextArea
              id="about-institutional"
              label="Texto institucional"
              value={draft.about.institutionalText}
              onChange={(value) => changeAbout("institutionalText", value)}
              maxLength={3000}
            />
            <div>
              <SectionHeading
                title="Fotografias institucionais"
                description="Adicione URLs HTTPS de imagens autorizadas. Até oito fotografias."
              />
              <div className="space-y-3">
                {draft.about.photoUrls.map((url, index) => (
                  <div key={`about-photo-${index}`} className="flex gap-2">
                    <input
                      type="url"
                      aria-label={`URL da fotografia ${index + 1}`}
                      value={url}
                      required
                      onChange={(event) =>
                        changeAbout(
                          "photoUrls",

                          draft.about.photoUrls.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        )
                      }
                      className={fieldClass}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      aria-label={`Remover fotografia ${index + 1}`}
                      onClick={() =>
                        changeAbout(
                          "photoUrls",

                          draft.about.photoUrls.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      className="min-h-12 rounded-lg p-3 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={draft.about.photoUrls.length >= 8}
                  onClick={() =>
                    changeAbout("photoUrls", [...draft.about.photoUrls, ""])
                  }
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#2E7D6B] px-4 font-semibold text-[#2E7D6B] disabled:opacity-50"
                >
                  <Plus size={18} /> Adicionar fotografia
                </button>
              </div>
            </div>
            {draft.about.photoUrls.some(
              (url) => isValidHttpsUrl(url) && url,
            ) && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {draft.about.photoUrls

                  .filter((url) => isValidHttpsUrl(url) && url)

                  .map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt="Prévia da fotografia institucional"
                      className="h-32 w-full rounded-xl object-cover"
                    />
                  ))}
              </div>
            )}
            <TextArea
              id="about-additional-info"
              label="Informações públicas adicionais"
              value={draft.about.additionalInfo}
              onChange={(value) => changeAbout("additionalInfo", value)}
              maxLength={3000}
            />
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="space-y-5">
            <SectionHeading
              title="Campanhas, avisos e eventos"
              description="Itens só aparecem publicamente quando estão visíveis e dentro do período informado. Campanhas expiradas são ocultadas automaticamente."
            />
            {draft.campaigns.map((campaign, index) => (
              <article
                key={campaign.id}
                className="space-y-4 rounded-xl border border-[#d8e5df] p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-[#2E7D6B]">
                    {campaign.title || `Novo item ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => void removeCampaign(campaign.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={17} /> Remover
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`campaign-type-${campaign.id}`}
                      className="block text-sm font-semibold text-[#2E7D6B]"
                    >
                      Tipo
                    </label>
                    <select
                      id={`campaign-type-${campaign.id}`}
                      value={campaign.type}
                      onChange={(event) =>
                        updateCampaign(
                          campaign.id,

                          "type",

                          event.target.value as CampaignType,
                        )
                      }
                      className={fieldClass}
                    >
                      <option value="campanha">Campanha</option>
                      <option value="aviso">Aviso</option>
                      <option value="feira">Feira de adoção</option>
                      <option value="evento">Evento</option>
                    </select>
                  </div>
                  <Field
                    id={`campaign-title-${campaign.id}`}
                    label="Título"
                    value={campaign.title}
                    onChange={(value) =>
                      updateCampaign(campaign.id, "title", value)
                    }
                    required
                    maxLength={160}
                  />
                  <Field
                    id={`campaign-start-${campaign.id}`}
                    label="Data de início"
                    type="date"
                    value={campaign.startDate}
                    onChange={(value) =>
                      updateCampaign(campaign.id, "startDate", value)
                    }
                  />
                  <Field
                    id={`campaign-end-${campaign.id}`}
                    label="Data de término"
                    type="date"
                    value={campaign.endDate}
                    onChange={(value) =>
                      updateCampaign(campaign.id, "endDate", value)
                    }
                  />
                  <Field
                    id={`campaign-image-${campaign.id}`}
                    label="Imagem de destaque (URL HTTPS)"
                    type="url"
                    value={campaign.imageUrl}
                    onChange={(value) =>
                      updateCampaign(campaign.id, "imageUrl", value)
                    }
                    placeholder="https://..."
                  />
                  <Toggle
                    id={`campaign-visible-${campaign.id}`}
                    label="Visível no site"
                    checked={campaign.visible}
                    onChange={(checked) =>
                      updateCampaign(campaign.id, "visible", checked)
                    }
                  />
                </div>
                <TextArea
                  id={`campaign-description-${campaign.id}`}
                  label="Descrição"
                  value={campaign.description}
                  onChange={(value) =>
                    updateCampaign(campaign.id, "description", value)
                  }
                  maxLength={500}
                  rows={2}
                />
              </article>
            ))}
            <button
              type="button"
              disabled={draft.campaigns.length >= 20}
              onClick={addCampaign}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#E4B04A] px-5 font-semibold text-white hover:bg-[#d4a03a] disabled:opacity-50"
            >
              <Plus size={18} /> Adicionar campanha ou aviso
            </button>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#d8e5df] p-4">
              <h4 className="font-semibold text-[#2E7D6B]">
                Identificação e segurança
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                O acesso usa uma credencial simples definida no protótipo; não
                há servidor validando a sessão e a credencial está visível no
                código fonte. Não reutilize essa senha em produção. A alteração
                de senha não está implementada; nenhuma senha ou hash é
                armazenado nas configurações do site.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-red-300 px-5 font-semibold text-red-700 hover:bg-red-50"
            >
              <EyeOff size={18} /> Encerrar sessão
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e6eee9] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void discardChanges()}
            disabled={!currentIsDirty}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#2E7D6B] px-5 font-semibold text-[#2E7D6B] hover:bg-[#2E7D6B]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} /> Descartar alterações
          </button>
          <button
            type="submit"
            disabled={saving || !currentIsDirty}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#2E7D6B] px-6 font-semibold text-white transition-colors hover:bg-[#6FAE9C] disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} /> Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
