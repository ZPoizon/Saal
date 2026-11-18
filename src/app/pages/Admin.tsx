import { useCallback, useEffect, useRef, useState } from "react"

import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  Eye,
  EyeOff,
  Heart,
  Mail,
  MessageCircle,
  PawPrint,
  Phone,
  Plus,
  Settings,
  Edit,
  Trash2,
  X,
} from "lucide-react"

import { Link } from "react-router"

import { toast } from "sonner"

import { useConfirm } from "../components/ui/confirm"

import {
  AdminAuthError,
  getAdminAuthErrorMessage,
} from "../services/admin-auth"

import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../services/supabase-auth"

import {
  resourceFailureMessage,
  type FailureKind,
} from "../services/supabase-errors"

import { Animal, AnimalInput, AnimalStatus } from "../data/animals"

import {
  AnimalApiError,
  createAnimal,
  deleteAnimal,
  listAdminAnimals,
  updateAnimal,
  updateAnimalStatus,
} from "../services/supabase-animals"

import {
  InterestApiError,
  listAdminInterests,
} from "../services/supabase-interests"

import type { AdminAnimalInterest } from "../data/interests"

import { SafeImage } from "../components/SafeImage"

import { StatusDropdown } from "../components/StatusDropdown"

import logoSaal from "../../imports/logo_fundo_0.png"

import { AnimalForm } from "../components/admin/AnimalForm"

import { SiteSettingsPanel } from "../components/admin/SiteSettingsPanel"

import { buildInterestContactLinks } from "../utils/contact-links"

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError
}

/** Código PostgREST do erro, quando disponível, para diagnóstico seguro. */
function resourceErrorDetail(error: unknown): string | null {
  if (error instanceof AnimalApiError || error instanceof InterestApiError) {
    return error.code ?? null
  }

  return null
}

function adminResourceErrorMessage(
  error: unknown,

  resource: "animais" | "interessados",
): string {
  if (isNetworkFailure(error)) {
    return resourceFailureMessage("network", resource)
  }

  if (error instanceof AnimalApiError || error instanceof InterestApiError) {
    return resourceFailureMessage(error.kind as FailureKind, resource)
  }

  return resourceFailureMessage("unknown", resource)
}

/** Rótulo legível da espécie, usado na tabela e nos cards. */
function speciesLabel(species: "dog" | "cat"): string {
  return species === "dog" ? "Canino" : "Felino"
}

/** Opções do dropdown de status, com ícone discreto no estado adotado. */
const animalStatusOptions = [
  { value: "available" as const, label: "Disponível" },
  {
    value: "adopted" as const,
    label: "Adotado",
    icon: <Heart size={14} className="fill-current" aria-hidden="true" />,
  },
]

/** Visual do badge/dropdown de status, coerente com a identidade visual. */
function statusButtonClass(status: AnimalStatus, busy: boolean): string {
  return `flex w-full items-center justify-between gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4B04A] sm:text-sm ${
    status === "available"
      ? "border-[#2E7D6B]/30 bg-[#2E7D6B]/10 text-[#2E7D6B] hover:bg-[#2E7D6B]/20"
      : "border-[#E4B04A]/40 bg-[#E4B04A]/10 text-[#6b4e12] hover:bg-[#E4B04A]/20"
  } ${busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`
}

export function Admin() {
  const [authStatus, setAuthStatus] =
    useState<"checking" | "anonymous" | "authenticated" | "error">("checking")

  const [credentials, setCredentials] = useState({ username: "", password: "" })

  const [showPassword, setShowPassword] = useState(false)

  const [authMessage, setAuthMessage] = useState<string | null>(null)

  const [sessionWarning, setSessionWarning] = useState<string | null>(null)

  const [isRechecking, setIsRechecking] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [animals, setAnimals] = useState<Animal[]>([])

  const [animalsStatus, setAnimalsStatus] =
    useState<"loading" | "success" | "error">("loading")

  const [animalsMessage, setAnimalsMessage] = useState<string | null>(null)

  const [animalsErrorDetail, setAnimalsErrorDetail] = useState<string | null>(
    null,
  )

  const [interests, setInterests] = useState<AdminAnimalInterest[]>([])

  const [interestsStatus, setInterestsStatus] =
    useState<"loading" | "success" | "error">("loading")

  const [interestsMessage, setInterestsMessage] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)

  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)

  const [siteSettingsDirty, setSiteSettingsDirty] = useState(false)

  const [openContactId, setOpenContactId] = useState<string | null>(null)

  const [activeTab, setActiveTab] =
    useState<"animals" | "interests" | "settings">("animals")

  const [updatingStatus, setUpdatingStatus] = useState<{
    id: string
    status: AnimalStatus
  } | null>(null)

  const [confirmingAdoption, setConfirmingAdoption] = useState<{
    interestId: string
    animalId: string
    animalName: string
  } | null>(null)

  const confirm = useConfirm()

  /** Estado mais recente para listeners registrados uma única vez. */
  const adminStateRef = useRef({ activeTab, siteSettingsDirty })

  useEffect(() => {
    adminStateRef.current = { activeTab, siteSettingsDirty }
  })

  const checkSession = useCallback(
    async (mode: "initial" | "revalidate") => {
      if (mode === "initial") {
        setAuthStatus("checking")

        setAuthMessage(null)
      } else {
        setIsRechecking(true)
      }

      try {
        const session = await getAdminSession()

        if (!session) {
          setAuthStatus("anonymous")

          setSessionWarning(null)

          setAuthMessage(
            mode === "revalidate" ? "Sessão expirada. Entre novamente." : null,
          )

          return
        }

        setAuthStatus("authenticated")

        setAuthMessage(null)

        setSessionWarning(null)
      } catch (error) {
        const message = getAdminAuthErrorMessage(error, "session")

        // Uma falha momentânea de rede não deve expulsar quem já está no painel:

        // as mutações continuam protegidas e autorizadas no servidor.

        if (mode === "revalidate") {
          setSessionWarning(message)

          return
        }

        setAuthStatus("error")

        setSessionWarning(null)

        setAuthMessage(message)
      } finally {
        if (mode === "revalidate") setIsRechecking(false)
      }
    },

    [],
  )

  const loadAnimals = useCallback(async () => {
    setAnimalsStatus("loading")

    setAnimalsMessage(null)

    setAnimalsErrorDetail(null)

    try {
      setAnimals(await listAdminAnimals())

      setAnimalsStatus("success")
    } catch (error) {
      if (
        error instanceof AnimalApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setAuthStatus("anonymous")

        setAuthMessage("Sessão expirada. Entre novamente.")

        return
      }

      setAnimalsStatus("error")

      setAnimalsMessage(adminResourceErrorMessage(error, "animais"))

      setAnimalsErrorDetail(resourceErrorDetail(error))
    }
  }, [])

  const loadInterests = useCallback(async () => {
    setInterestsStatus("loading")

    setInterestsMessage(null)

    try {
      setInterests(await listAdminInterests())

      setInterestsStatus("success")
    } catch (error) {
      if (
        error instanceof InterestApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setAuthStatus("anonymous")

        setAuthMessage("Sessão expirada. Entre novamente.")

        return
      }

      setInterestsStatus("error")

      setInterestsMessage(adminResourceErrorMessage(error, "interessados"))
    }
  }, [])

  useEffect(() => {
    if (authStatus !== "authenticated") return

    void loadAnimals()
  }, [authStatus, loadAnimals])

  useEffect(() => {
    if (authStatus !== "authenticated") return

    void loadInterests()
  }, [authStatus, loadInterests])

  useEffect(() => {
    void checkSession("initial")
  }, [checkSession])

  useEffect(() => {
    if (authStatus !== "authenticated") return

    const verifySession = () => {
      if (document.visibilityState !== "visible") return

      void checkSession("revalidate")
    }

    window.addEventListener("focus", verifySession)

    document.addEventListener("visibilitychange", verifySession)

    return () => {
      window.removeEventListener("focus", verifySession)

      document.removeEventListener("visibilitychange", verifySession)
    }
  }, [authStatus, checkSession])

  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (
      hash === "" ||
      hash === "animals" ||
      hash === "interests" ||
      hash === "settings"
    ) {
      setActiveTab(
        (hash as "animals" | "interests" | "settings" ||
          "animals") as "animals" | "interests" | "settings",
      )
    }
  }, [])

  useEffect(() => {
    if (window.location.hash.replace("#", "") !== activeTab) {
      window.location.hash = activeTab
    }
  }, [activeTab])

  useEffect(() => {
    let confirming = false

    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash === "animals" || hash === "interests" || hash === "settings") {
        const { activeTab: currentTab, siteSettingsDirty: dirty } =
          adminStateRef.current

        if (hash === currentTab) return

        if (currentTab === "settings" && dirty) {
          // Confirmação pendente: volta imediatamente para a seção atual
          // para não sair da tela sem decisão do usuário.
          if (confirming) {
            window.location.hash = currentTab

            return
          }

          confirming = true

          void confirm({
            title: "Descartar alterações?",
            description:
              "Você possui alterações que ainda não foram salvas. Deseja sair sem salvar?",
            confirmLabel: "Descartar alterações",
            cancelLabel: "Continuar editando",
            variant: "warning",
          })
            .then((discard) => {
              if (discard) {
                setSiteSettingsDirty(false)

                setActiveTab(hash)
              } else {
                window.location.hash = currentTab
              }
            })
            .finally(() => {
              confirming = false
            })

          return
        }

        setActiveTab(hash as "animals" | "interests" | "settings")
      }
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [confirm])

  const retrySessionCheck = () => {
    void checkSession("initial")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    setAuthMessage(null)

    try {
      await loginAdmin(credentials.username, credentials.password)

      setCredentials((current) => ({ ...current, password: "" }))

      setAuthStatus("authenticated")

      setSessionWarning(null)
    } catch (error) {
      const failure =
        error instanceof AdminAuthError ? error.failure : "unknown"

      // Falhas de conexão/servidor mantêm o botão de nova tentativa visível;

      // credencial inválida e limite de tentativas voltam ao formulário.

      setAuthStatus(
        failure === "unauthorized" ||
          failure === "rate-limited" ||
          failure === "forbidden"
          ? "anonymous"
          : "error",
      )

      setAuthMessage(getAdminAuthErrorMessage(error, "login"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    const { siteSettingsDirty: dirty } = adminStateRef.current

    if (dirty) {
      const discard = await confirm({
        title: "Descartar alterações?",
        description:
          "Você possui alterações que ainda não foram salvas. Deseja sair sem salvar?",
        confirmLabel: "Descartar alterações",
        cancelLabel: "Continuar editando",
        variant: "warning",
      })

      if (!discard) return

      setSiteSettingsDirty(false)
    }

    setIsSubmitting(true)

    setAuthMessage(null)

    try {
      await logoutAdmin()

      setAuthStatus("anonymous")

      setSessionWarning(null)

      setCredentials({ username: "", password: "" })
    } catch (error) {
      setAuthMessage(getAdminAuthErrorMessage(error, "logout"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const requestTabChange = async (
    nextTab: "animals" | "interests" | "settings",
  ): Promise<boolean> => {
    const { activeTab: currentTab, siteSettingsDirty: dirty } =
      adminStateRef.current

    if (currentTab === "settings" && dirty && nextTab !== "settings") {
      const discard = await confirm({
        title: "Descartar alterações?",
        description:
          "Você possui alterações que ainda não foram salvas. Deseja sair sem salvar?",
        confirmLabel: "Descartar alterações",
        cancelLabel: "Continuar editando",
        variant: "warning",
      })

      if (!discard) return false

      setSiteSettingsDirty(false)
    }

    return true
  }

  const handleAddAnimal = () => {
    setEditingAnimal(null)

    setShowForm(true)
  }

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal)

    setShowForm(true)
  }

  const handleDeleteAnimal = (animal: Animal) => {
    void confirm({
      title: "Excluir animal?",
      description: `Você tem certeza de que deseja excluir o cadastro de ${animal.name}? A ficha e as fotografias ficarão indisponíveis no catálogo. Esta ação não pode ser desfeita.`,
      confirmLabel: "Sim, excluir",
      cancelLabel: "Cancelar",
      variant: "destructive",
      failureMessage: "Não foi possível excluir o animal. Tente novamente.",
      onConfirm: async () => {
        try {
          await deleteAnimal(animal.id)

          setAnimals((current) =>
            current.filter((item) => item.id !== animal.id),
          )

          setAnimalsStatus("success")

          setAnimalsMessage(null)

          setAnimalsErrorDetail(null)

          toast.success("Animal excluído.")
        } catch (error) {
          // A lista permanece intacta: nenhuma perda de dados na falha.
          if (
            error instanceof AnimalApiError &&
            (error.status === 401 || error.status === 403)
          ) {
            setAuthStatus("anonymous")

            setAuthMessage("Sessão expirada. Entre novamente.")
          }

          throw new Error(adminResourceErrorMessage(error, "animais"))
        }
      },
    })
  }

  const handleSaveAnimal = async (input: AnimalInput) => {
    try {
      if (editingAnimal) {
        const updated = await updateAnimal(editingAnimal.id, input)

        setAnimals((current) =>
          current.map((animal) =>
            animal.id === updated.id ? updated : animal,
          ),
        )
      } else {
        const created = await createAnimal(input)

        setAnimals((current) => [...current, created])
      }

      setAnimalsStatus("success")

      setAnimalsMessage(null)

      setAnimalsErrorDetail(null)

      setShowForm(false)

      setEditingAnimal(null)

      toast.success(
        editingAnimal ? "Alterações salvas." : "Animal cadastrado com sucesso.",
      )
    } catch (error) {
      if (
        error instanceof AnimalApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setAuthStatus("anonymous")

        setAuthMessage("Sessão expirada. Entre novamente.")
      }

      throw error
    }
  }

  const handleChangeStatus = async (
    animal: Animal,
    newStatus: AnimalStatus,
  ) => {
    if (animal.status === newStatus) return

    // Uma alteração por vez: evita atualizações duplicadas em paralelo.
    if (updatingStatus) return

    setUpdatingStatus({ id: animal.id, status: newStatus })

    setAnimalsMessage(null)

    setAnimalsErrorDetail(null)

    try {
      // Operação dedicada: grava somente o status. A interface só muda o
      // badge depois que o Supabase confirma a atualização.
      const updated = await updateAnimalStatus(animal.id, newStatus)

      setAnimals((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )

      setAnimalsStatus("success")

      setAnimalsMessage(null)

      toast.success("Status atualizado.")
    } catch (error) {
      // Sem alteração otimista: o status anterior permanece na tabela.
      if (
        error instanceof AnimalApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setAuthStatus("anonymous")
        setAuthMessage("Sessão expirada. Entre novamente.")
        return
      }

      // Falha de ação: toast em vez do alerta da listagem (evita duplicar
      // avisos; o alerta inline fica para falhas de carregamento).
      toast.error(adminResourceErrorMessage(error, "animais"))
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleConfirmAdoption = async () => {
    if (!confirmingAdoption) return

    const animal = animals.find((a) => a.id === confirmingAdoption.animalId)

    if (!animal) {
      setConfirmingAdoption(null)

      setUpdatingStatus(null)

      return
    }

    if (animal.status === "adopted") {
      setConfirmingAdoption(null)

      return
    }

    setUpdatingStatus({ id: animal.id, status: "adopted" })

    try {
      const updated = await updateAnimalStatus(animal.id, "adopted")

      setAnimals((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )

      setAnimalsStatus("success")

      setAnimalsMessage(null)

      toast.success("Status atualizado.")
    } catch (error) {
      if (
        error instanceof AnimalApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setAuthStatus("anonymous")
        setAuthMessage("Sessão expirada. Entre novamente.")
        return
      }

      toast.error(adminResourceErrorMessage(error, "animais"))
    } finally {
      setConfirmingAdoption(null)

      setUpdatingStatus(null)
    }
  }

  if (authStatus !== "authenticated") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#F5EFE6] px-4 py-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-6 inline-flex min-h-11 items-center gap-2 font-semibold text-[#2E7D6B] transition-colors hover:text-[#E4B04A]"
          >
            <ArrowLeft size={20} />
            Voltar ao Início
          </Link>
          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8 md:p-12">
            <div className="mb-8 text-center">
              <img
                src={logoSaal}
                alt="SAAL"
                className="mx-auto mb-4 h-16 w-16 object-contain sm:h-20 sm:w-20"
              />
              <h1 className="mb-2 text-2xl font-bold text-[#2E7D6B] sm:text-3xl">
                Área Administrativa
              </h1>
              <p className="text-[#6FAE9C]">
                SAAL - Santuário de Animais Anjos da Luz
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {authStatus === "checking" && (
                <p role="status" className="text-sm text-[#6FAE9C]">
                  Verificando sessão administrativa…
                </p>
              )}
              {authMessage && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {authMessage}
                </p>
              )}
              {authStatus === "error" && (
                <button
                  type="button"
                  onClick={retrySessionCheck}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#2E7D6B] px-4 py-2 text-sm font-semibold text-[#2E7D6B] transition-colors hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
                >
                  Tentar novamente
                </button>
              )}
              <div>
                <label htmlFor="username" className="block text-[#2E7D6B] mb-2">
                  Usuário
                </label>
                <input
                  type="text"
                  id="username"
                  autoComplete="username"
                  required
                  disabled={authStatus === "checking" || isSubmitting}
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Usuário configurado para a ONG"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[#2E7D6B] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    required
                    disabled={authStatus === "checking" || isSubmitting}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 pr-12 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6FAE9C] transition-colors hover:text-[#2E7D6B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authStatus === "checking" || isSubmitting}
                className="min-h-11 w-full rounded-full bg-[#2E7D6B] py-3 font-semibold text-white shadow-md transition-all hover:bg-[#6FAE9C] hover:shadow-lg"
              >
                {isSubmitting ? "Aguarde…" : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-2 text-2xl font-bold text-[#2E7D6B] sm:text-3xl">
              Painel Administrativo
            </h1>
            <p className="text-[#6FAE9C]">Gerencie os animais e interessados</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto max-w-xs sm:max-w-none"
          >
            {isSubmitting ? "Aguarde…" : "Sair"}
          </button>
        </div>
        {authMessage && (
          <p
            role="alert"
            className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {authMessage}
          </p>
        )}

        {sessionWarning && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-[#E4B04A]/60 bg-white px-4 py-3 text-sm text-[#416f65]"
          >
            <p>{sessionWarning}</p>
            <button
              type="button"
              onClick={() => void checkSession("revalidate")}
              disabled={isRechecking}
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2E7D6B] px-4 py-2 text-sm font-semibold text-[#2E7D6B] transition-colors hover:bg-[#F5EFE6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRechecking ? "Verificando…" : "Tentar novamente"}
            </button>
          </div>
        )}

        <nav
          aria-label="Navegação administrativa"
          className="mb-8 flex flex-wrap justify-center items-center gap-1 rounded-2xl bg-white p-2 sm:p-3 shadow-md"
        >
          <button
            type="button"
            aria-pressed={activeTab === "animals"}
            onClick={() => {
              void requestTabChange("animals").then((allowed) => {
                if (allowed) setActiveTab("animals")
              })
            }}
            className={`inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A] sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "animals"
                ? "bg-[#2E7D6B] text-white"
                : "text-[#2E7D6B] hover:bg-[#F5EFE6]"
            }`}
          >
            Animais
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "interests"}
            onClick={() => {
              void requestTabChange("interests").then((allowed) => {
                if (allowed) setActiveTab("interests")
              })
            }}
            className={`inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A] sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "interests"
                ? "bg-[#2E7D6B] text-white"
                : "text-[#2E7D6B] hover:bg-[#F5EFE6]"
            }`}
          >
            Interessados
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "settings"}
            onClick={() => {
              void requestTabChange("settings").then((allowed) => {
                if (allowed) setActiveTab("settings")
              })
            }}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A] sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "settings"
                ? "bg-[#2E7D6B] text-white"
                : "text-[#2E7D6B] hover:bg-[#F5EFE6]"
            }`}
          >
            <Settings size={14} />
            Configuração
          </button>
        </nav>

        {activeTab === "settings" ? (
          <SiteSettingsPanel
            onLogout={handleLogout}
            onDirtyChange={setSiteSettingsDirty}
            animals={animals}
          />
        ) : (
          <>
            {activeTab === "animals" && (
              <>
                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
                  <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm text-[#6FAE9C] sm:text-base">
                        Total de Animais
                      </span>
                      <PawPrint className="shrink-0 text-[#E4B04A]" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-[#2E7D6B] sm:text-3xl">
                      {animals.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm text-[#6FAE9C] sm:text-base">
                        Disponíveis
                      </span>
                      <Heart className="shrink-0 text-[#2E7D6B]" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-[#2E7D6B] sm:text-3xl">
                      {animals.filter((a) => a.status === "available").length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm text-[#6FAE9C] sm:text-base">
                        Adotados
                      </span>
                      <Heart
                        className="shrink-0 text-green-500"
                        size={20}
                        fill="currentColor"
                      />
                    </div>
                    <p className="text-2xl font-bold text-[#2E7D6B] sm:text-3xl">
                      {animals.filter((a) => a.status === "adopted").length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm text-[#6FAE9C] sm:text-base">
                        Solicitações
                      </span>
                      <Mail className="shrink-0 text-[#E4B04A]" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-[#2E7D6B] sm:text-3xl">
                      {interestsStatus === "success" ? interests.length : "—"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mb-6 rounded-2xl bg-white p-4 shadow-md sm:mb-8 sm:p-6">
                  <button
                    onClick={handleAddAnimal}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#E4B04A] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#d4a03a] sm:w-auto"
                  >
                    <Plus size={20} />
                    Cadastrar Novo Animal
                  </button>
                </div>

                {/* Animals Table */}
                <div
                  id="animals"
                  className="scroll-mt-24 bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F5EFE6] px-4 py-4 sm:px-6 sm:py-5">
                    <h2 className="text-lg font-bold text-[#2E7D6B] sm:text-xl">
                      Animais Cadastrados
                    </h2>
                    <span className="rounded-full bg-[#2E7D6B]/10 px-3 py-1 text-xs font-semibold text-[#2E7D6B] sm:text-sm">
                      {animalsStatus === "success"
                        ? `${animals.length} ${
                            animals.length === 1 ? "registro" : "registros"
                          }`
                        : "—"}
                    </span>
                  </div>

                  {/* Alerta compacto e único: substitui o aviso antigo da API. */}
                  {animalsMessage && (
                    <div
                      role="alert"
                      className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:mx-6"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle
                          className="mt-0.5 shrink-0 text-red-600"
                          size={18}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-red-700">
                            {animalsMessage}
                          </p>
                          {animalsErrorDetail && (
                            <p className="mt-0.5 text-xs text-red-500">
                              Código do banco: {animalsErrorDetail}
                            </p>
                          )}
                        </div>
                        {animalsStatus === "error" && (
                          <button
                            type="button"
                            onClick={() => void loadAnimals()}
                            className="shrink-0 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                          >
                            Tentar novamente
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {animalsStatus === "loading" && (
                    <p
                      role="status"
                      className="px-4 py-10 text-center text-[#6FAE9C] sm:px-6"
                    >
                      Carregando animais…
                    </p>
                  )}

                  {animalsStatus === "success" && animals.length === 0 && (
                    <div className="px-4 py-10 text-center sm:px-6">
                      <PawPrint
                        className="mx-auto mb-3 text-[#E4B04A]"
                        size={36}
                      />
                      <p className="font-semibold text-[#2E7D6B]">
                        Nenhum animal cadastrado ainda.
                      </p>
                      <p className="mt-1 text-sm text-[#6FAE9C]">
                        Use o botão “Cadastrar Novo Animal” para adicionar o
                        primeiro.
                      </p>
                    </div>
                  )}

                  {animalsStatus === "success" && animals.length > 0 && (
                    <>
                      {/* Tabela em desktop */}
                      <table className="hidden w-full table-fixed md:table">
                        <thead className="bg-[#F5EFE6]">
                          <tr>
                            <th className="w-24 px-6 py-3.5 text-left text-sm font-semibold text-[#2E7D6B]">
                              Foto
                            </th>
                            <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#2E7D6B]">
                              Nome
                            </th>
                            <th className="w-28 px-4 py-3.5 text-left text-sm font-semibold text-[#2E7D6B]">
                              Espécie
                            </th>
                            <th className="w-32 px-4 py-3.5 text-left text-sm font-semibold text-[#2E7D6B]">
                              Idade
                            </th>
                            <th className="w-44 px-4 py-3.5 text-left text-sm font-semibold text-[#2E7D6B]">
                              Status
                            </th>
                            <th className="w-28 px-4 py-3.5 text-right text-sm font-semibold text-[#2E7D6B]">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5EFE6]">
                          {animals.map((animal) => (
                            <tr
                              key={animal.id}
                              className="transition-colors hover:bg-[#F5EFE6]/50"
                            >
                              <td className="px-6 py-4">
                                <SafeImage
                                  src={animal.images[0]}
                                  alt={animal.name}
                                  params={{ w: 120, h: 120, fit: "crop" }}
                                  className="h-12 w-12 rounded-xl object-cover"
                                />
                              </td>
                              <td className="break-words px-4 py-4 font-semibold text-[#2E7D6B]">
                                {animal.name}
                              </td>
                              <td className="px-4 py-4 text-[#6FAE9C]">
                                {speciesLabel(animal.species)}
                              </td>
                              <td className="px-4 py-4 text-[#6FAE9C]">
                                {animal.age}
                              </td>
                              <td className="px-4 py-4">
                                <StatusDropdown
                                  value={animal.status}
                                  options={animalStatusOptions}
                                  onChange={(newStatus) => {
                                    void handleChangeStatus(animal, newStatus)
                                  }}
                                  disabled={updatingStatus?.id === animal.id}
                                  buttonClassName={statusButtonClass(
                                    animal.status,
                                    updatingStatus?.id === animal.id,
                                  )}
                                />
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleEditAnimal(animal)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2E7D6B] transition-colors hover:bg-[#F5EFE6]"
                                    aria-label={`Editar ${animal.name}`}
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      void handleDeleteAnimal(animal)
                                    }
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50"
                                    aria-label={`Excluir ${animal.name}`}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Cards administrativos em telas pequenas */}
                      <ul className="divide-y divide-[#F5EFE6] md:hidden">
                        {animals.map((animal) => (
                          <li key={animal.id} className="p-4">
                            <div className="flex items-start gap-3">
                              <SafeImage
                                src={animal.images[0]}
                                alt={animal.name}
                                params={{ w: 120, h: 120, fit: "crop" }}
                                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="break-words font-semibold text-[#2E7D6B]">
                                  {animal.name}
                                </p>
                                <p className="mt-0.5 text-sm text-[#6FAE9C]">
                                  {speciesLabel(animal.species)} • {animal.age}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-row gap-1">
                                <button
                                  onClick={() => handleEditAnimal(animal)}
                                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2E7D6B] transition-colors hover:bg-[#F5EFE6]"
                                  aria-label={`Editar ${animal.name}`}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    void handleDeleteAnimal(animal)
                                  }
                                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50"
                                  aria-label={`Excluir ${animal.name}`}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3">
                              <StatusDropdown
                                value={animal.status}
                                options={animalStatusOptions}
                                onChange={(newStatus) => {
                                  void handleChangeStatus(animal, newStatus)
                                }}
                                disabled={updatingStatus?.id === animal.id}
                                buttonClassName={statusButtonClass(
                                  animal.status,
                                  updatingStatus?.id === animal.id,
                                )}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </>
            )}
            {activeTab === "interests" && (
              <>
                {/* Interests Section */}
                <div
                  id="interests"
                  className="scroll-mt-24 bg-white rounded-2xl shadow-md overflow-hidden mt-8"
                >
                  <div className="border-b border-[#F5EFE6] p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-lg font-bold text-[#2E7D6B] sm:text-xl">
                        <Mail size={20} className="shrink-0 text-[#E4B04A]" />
                        Solicitações de Adoção
                      </h2>
                      <span className="rounded-full bg-[#E4B04A] px-3 py-1 text-xs font-semibold text-white sm:text-sm">
                        {interestsStatus === "success"
                          ? `${interests.length} registros`
                          : interestsStatus === "loading"
                            ? "Carregando…"
                            : "Indisponível"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    {interestsStatus === "loading" ? (
                      <p
                        role="status"
                        className="py-8 text-center text-[#6FAE9C]"
                      >
                        Carregando interessados…
                      </p>
                    ) : interestsStatus === "error" ? (
                      <div className="py-8 text-center">
                        <p role="alert" className="text-[#2E7D6B]">
                          {interestsMessage}
                        </p>
                        <button
                          type="button"
                          onClick={() => void loadInterests()}
                          className="mt-3 text-sm font-semibold text-[#527f74] underline underline-offset-4 hover:text-[#E4B04A]"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    ) : interests.length === 0 ? (
                      <p className="text-[#6FAE9C] text-center py-8">
                        Nenhum interessado registrado.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {interests.map((interest) => {
                          const animal = animals.find(
                            (candidate) => candidate.id === interest.animalId,
                          )

                          const links = buildInterestContactLinks({
                            whatsapp: interest.whatsapp,

                            email: interest.email,
                          })

                          return (
                            <div
                              key={interest.id}
                              className="rounded-xl border border-[#E4B04A]/60 bg-[#E4B04A]/5 p-4"
                            >
                              <div className="flex flex-col gap-4 md:flex-row">
                                <div className="flex items-center gap-3 md:w-1/3">
                                  {animal?.images[0] && (
                                    <SafeImage
                                      src={animal.images[0]}
                                      alt={interest.animalName}
                                      params={{ w: 60, h: 60, fit: "crop" }}
                                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-semibold text-[#2E7D6B]">
                                      {interest.animalName}
                                    </p>
                                    <p className="text-xs text-[#6FAE9C]">
                                      {new Date(
                                        interest.createdAt,
                                      ).toLocaleString(
                                        "pt-BR",

                                        {
                                          day: "2-digit",

                                          month: "2-digit",

                                          year: "numeric",

                                          hour: "2-digit",

                                          minute: "2-digit",
                                        },
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex-1 md:w-1/3">
                                  <p className="font-semibold text-[#2E7D6B]">
                                    {interest.fullName}
                                  </p>
                                  <p className="text-sm text-[#6FAE9C]">
                                    {interest.city}
                                  </p>
                                  <p className="text-sm text-[#6FAE9C]">
                                    {interest.email}
                                  </p>
                                  <p className="text-sm text-[#6FAE9C]">
                                    {interest.whatsapp}
                                  </p>
                                </div>

                                <div className="flex-col gap-3 md:flex-row md:w-1/3 md:flex-none md:justify-center">
                                  <button
                                    type="button"
                                    aria-expanded={
                                      openContactId === interest.id
                                    }
                                    aria-controls={`contact-actions-${interest.id}`}
                                    onClick={() =>
                                      setOpenContactId((current) =>
                                        current === interest.id
                                          ? null
                                          : interest.id,
                                      )
                                    }
                                    className="flex-1 rounded-lg bg-[#2E7D6B] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#6FAE9C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4B04A] md:flex-none"
                                  >
                                    Entrar em contato
                                  </button>
                                  <div
                                    id={`contact-actions-${interest.id}`}
                                    className={
                                      openContactId === interest.id
                                        ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                                        : "hidden"
                                    }
                                  >
                                    {links.whatsapp && (
                                      <a
                                        href={links.whatsapp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1fae54] md:flex-none"
                                      >
                                        <MessageCircle size={16} />
                                        WhatsApp
                                      </a>
                                    )}
                                    {links.phone && (
                                      <a
                                        href={links.phone}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#2E7D6B] px-3 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6] md:flex-none"
                                      >
                                        <Phone size={16} />
                                        Ligar
                                      </a>
                                    )}
                                    {links.email && (
                                      <a
                                        href={links.email}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#2E7D6B] px-3 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6] md:flex-none"
                                      >
                                        <AtSign size={16} />
                                        Enviar e-mail
                                      </a>
                                    )}
                                    {!links.whatsapp &&
                                      !links.phone &&
                                      !links.email && (
                                        <p className="text-sm text-gray-600">
                                          Dados de contato indisponíveis.
                                        </p>
                                      )}
                                    <p className="w-full text-xs text-gray-500">
                                      Os links abrem o aplicativo escolhido;
                                      nenhuma mensagem é enviada
                                      automaticamente.
                                    </p>
                                  </div>

                                  {animal && animal.status === "available" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmingAdoption({
                                          interestId: interest.id,
                                          animalId: animal.id,
                                          animalName: interest.animalName,
                                        })
                                      }
                                      disabled={
                                        updatingStatus?.id === animal.id
                                      }
                                      className="mt-3 flex-1 rounded-lg border border-[#2E7D6B] px-4 py-2 font-semibold text-[#2E7D6B] transition-colors hover:bg-[#2E7D6B]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A] md:flex-none disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Confirmar Adoção
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <AnimalForm
          animal={editingAnimal || undefined}
          onSave={handleSaveAnimal}
          onCancel={() => {
            setShowForm(false)

            setEditingAnimal(null)
          }}
        />
      )}

      {/* Confirm Adoption Modal */}
      {confirmingAdoption && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-adoption-title"
        >
          <div className="my-auto flex max-w-md flex-col rounded-2xl bg-white sm:max-w-lg sm:max-h-[calc(100dvh-2rem)]">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#F5EFE6] p-4 sm:p-6">
              <h2
                id="confirm-adoption-title"
                className="text-xl font-bold text-[#2E7D6B] sm:text-2xl"
              >
                Confirmar Adoção
              </h2>
              <button
                type="button"
                onClick={() => setConfirmingAdoption(null)}
                aria-label="Fechar"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
              >
                <X className="text-[#6FAE9C]" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#E4B04A]/10 p-3 text-[#E4B04A]">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="mb-1 font-semibold text-[#2E7D6B]">
                    Confirmar adoção de "{confirmingAdoption.animalName}"?
                  </p>
                  <p className="text-sm text-[#6FAE9C]">
                    O status do animal será alterado para Adotado em todo o
                    painel. Esta ação pode ser desfeita editando o animal.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 pb-6 px-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setConfirmingAdoption(null)}
                disabled={updatingStatus?.id === confirmingAdoption.animalId}
                className="min-h-11 flex-1 rounded-full bg-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAdoption}
                disabled={updatingStatus?.id === confirmingAdoption.animalId}
                className="min-h-11 flex-1 rounded-full bg-[#E4B04A] py-3 font-semibold text-white transition-colors hover:bg-[#d4a03a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingStatus?.id === confirmingAdoption.animalId
                  ? "Confirmando…"
                  : "Sim, confirmar adoção"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
