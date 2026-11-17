import { useCallback, useEffect, useState } from "react"

import {
  ArrowLeft,
  AtSign,
  Heart,
  Mail,
  MessageCircle,
  PawPrint,
  Phone,
  Plus,
  Settings,
  Edit,
} from "lucide-react"

import { Link } from "react-router"

import {
  AdminAuthError,
  getAdminAuthErrorMessage,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../services/admin-auth"

import { Animal, AnimalInput } from "../data/animals"

import {
  AnimalApiError,
  createAnimal,
  listAdminAnimals,
  updateAnimal,
} from "../services/animals-api"

import { InterestApiError, listAdminInterests } from "../services/interests-api"

import type { AdminAnimalInterest } from "../data/interests"

import { SafeImage } from "../components/SafeImage"

import logoSaal from "../../imports/logo_fundo_0.png"

import { AnimalForm } from "../components/admin/AnimalForm"

import { SiteSettingsPanel } from "../components/admin/SiteSettingsPanel"

import { buildInterestContactLinks } from "../utils/contact-links"

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError
}

function adminResourceErrorMessage(
  error: unknown,

  resource: "animais" | "interessados",
): string {
  if (isNetworkFailure(error)) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
  }

  if (error instanceof AnimalApiError || error instanceof InterestApiError) {
    if (error.status === 404) {
      return `O serviço de ${resource} não foi encontrado. A API pode não estar publicada ou o proxy /api não está configurado.`
    }

    if (error.status === 429) {
      return "Muitas solicitações em pouco tempo. Aguarde e tente novamente."
    }

    if (error.status >= 500) {
      return "O servidor está temporariamente indisponível. Tente novamente em instantes."
    }
  }

  return `Não foi possível carregar os ${resource}. Tente novamente.`
}

export function Admin() {
  const [authStatus, setAuthStatus] =
    useState<"checking" | "anonymous" | "authenticated" | "error">("checking")

  const [credentials, setCredentials] = useState({ username: "", password: "" })

  const [authMessage, setAuthMessage] = useState<string | null>(null)

  const [sessionWarning, setSessionWarning] = useState<string | null>(null)

  const [isRechecking, setIsRechecking] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [animals, setAnimals] = useState<Animal[]>([])

  const [animalsStatus, setAnimalsStatus] =
    useState<"loading" | "success" | "error">("loading")

  const [animalsMessage, setAnimalsMessage] = useState<string | null>(null)

  const [interests, setInterests] = useState<AdminAnimalInterest[]>([])

  const [interestsStatus, setInterestsStatus] =
    useState<"loading" | "success" | "error">("loading")

  const [interestsMessage, setInterestsMessage] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)

  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)

  const [showSiteSettings, setShowSiteSettings] = useState(false)

  const [siteSettingsDirty, setSiteSettingsDirty] = useState(false)

  const [openContactId, setOpenContactId] = useState<string | null>(null)

  const checkSession = useCallback(
    async (mode: "initial" | "revalidate") => {
      if (mode === "initial") {
        setAuthStatus("checking")

        setAuthMessage(null)
      } else {
        setIsRechecking(true)
      }

      try {
        const authenticated = await getAdminSession()

        if (!authenticated) {
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
    if (
      siteSettingsDirty &&
      !window.confirm(
        "Há alterações não salvas nas configurações do site. Sair mesmo assim?",
      )
    ) {
      return
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

  const handleAddAnimal = () => {
    setEditingAnimal(null)

    setShowForm(true)
  }

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal)

    setShowForm(true)
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

      setShowForm(false)

      setEditingAnimal(null)
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
                <input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  disabled={authStatus === "checking" || isSubmitting}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="••••••••"
                />
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
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-start"
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

        <p
          role="status"
          className="mb-6 rounded-xl border border-[#E4B04A]/50 bg-white px-4 py-3 text-sm text-[#416f65]"
        >
          Os cadastros são salvos no servidor. As fotos podem vir da galeria do
          celular quando o armazenamento remoto estiver configurado; sem esse
          serviço, a prévia local não é enviada nem persistida.
        </p>

        <nav
          aria-label="Navegação administrativa"
          className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-md"
        >
          <a
            href="#animals"
            className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
          >
            Animais
          </a>
          <a
            href="#interests"
            className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
          >
            Interessados
          </a>
          <button
            type="button"
            aria-pressed={showSiteSettings}
            onClick={() => {
              if (
                showSiteSettings &&
                siteSettingsDirty &&
                !window.confirm(
                  "Há alterações não salvas nas configurações do site. Descartá-las e voltar ao painel?",
                )
              ) {
                return
              }

              setShowSiteSettings((visible) => !visible)
            }}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A] ${
              showSiteSettings
                ? "bg-[#2E7D6B] text-white"
                : "text-[#2E7D6B] hover:bg-[#F5EFE6]"
            }`}
          >
            <Settings size={16} />
            {showSiteSettings ? "Voltar ao painel" : "Configurações do Site"}
          </button>
        </nav>

        {showSiteSettings ? (
          <SiteSettingsPanel
            onLogout={handleLogout}
            onDirtyChange={setSiteSettingsDirty}
            animals={animals}
          />
        ) : (
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
              <div className="p-6 border-b border-[#F5EFE6]">
                <h2 className="text-xl font-bold text-[#2E7D6B]">
                  Animais Cadastrados
                </h2>
              </div>
              {animalsMessage && (
                <p
                  role="alert"
                  className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {animalsMessage}
                </p>
              )}
              <div>
                <table className="w-full table-fixed">
                  <thead className="bg-[#F5EFE6]">
                    <tr>
                      <th className="w-16 px-2 py-3 text-left text-sm text-[#2E7D6B] sm:w-auto sm:px-6 sm:text-base">
                        Foto
                      </th>
                      <th className="px-2 py-3 text-left text-sm text-[#2E7D6B] sm:px-6 sm:text-base">
                        Nome
                      </th>
                      <th className="hidden px-6 py-3 text-left text-[#2E7D6B] sm:table-cell">
                        Espécie
                      </th>
                      <th className="hidden px-6 py-3 text-left text-[#2E7D6B] md:table-cell">
                        Idade
                      </th>
                      <th className="px-2 py-3 text-left text-sm text-[#2E7D6B] sm:px-6 sm:text-base">
                        Status
                      </th>
                      <th className="w-14 px-1 py-3 text-right text-sm text-[#2E7D6B] sm:w-auto sm:px-6 sm:text-left sm:text-base">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFE6]">
                    {animalsStatus === "loading" && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-[#6FAE9C] sm:px-6"
                          role="status"
                        >
                          Carregando animais…
                        </td>
                      </tr>
                    )}
                    {animalsStatus === "error" && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center sm:px-6"
                        >
                          <p
                            role="alert"
                            className="text-sm font-semibold text-[#2E7D6B] sm:text-base"
                          >
                            {animalsMessage ??
                              "Não foi possível carregar os animais."}
                          </p>
                          <button
                            type="button"
                            onClick={() => void loadAnimals()}
                            className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#527f74] underline underline-offset-4 hover:text-[#E4B04A]"
                          >
                            Tentar novamente
                          </button>
                        </td>
                      </tr>
                    )}
                    {animalsStatus === "success" && animals.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-[#6FAE9C] sm:px-6"
                        >
                          Nenhum animal cadastrado.
                        </td>
                      </tr>
                    )}
                    {animalsStatus === "success" &&
                      animals.map((animal) => (
                        <tr
                          key={animal.id}
                          className="transition-colors hover:bg-[#F5EFE6]/50"
                        >
                          <td className="px-2 py-3 sm:px-6 sm:py-4">
                            <SafeImage
                              src={animal.images[0]}
                              alt={animal.name}
                              params={{ w: 60, h: 60, fit: "crop" }}
                              className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
                            />
                          </td>
                          <td className="break-words px-2 py-3 font-semibold text-[#2E7D6B] sm:px-6 sm:py-4">
                            {animal.name}
                          </td>
                          <td className="hidden px-6 py-4 text-[#6FAE9C] sm:table-cell">
                            {animal.species === "dog" ? "Cachorro" : "Gato"}
                          </td>
                          <td className="hidden px-6 py-4 text-[#6FAE9C] md:table-cell">
                            {animal.age}
                          </td>
                          <td className="px-2 py-3 sm:px-6 sm:py-4">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${
                                animal.status === "available"
                                  ? "bg-[#2E7D6B] text-white"
                                  : "bg-gray-400 text-white"
                              }`}
                            >
                              {animal.status === "available"
                                ? "Disponível"
                                : "Adotado"}
                            </span>
                          </td>
                          <td className="px-1 py-3 text-right sm:px-6 sm:py-4 sm:text-left">
                            <button
                              onClick={() => handleEditAnimal(animal)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2E7D6B] transition-colors hover:bg-[#F5EFE6]"
                              aria-label={`Editar ${animal.name}`}
                            >
                              <Edit size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                  <p role="status" className="py-8 text-center text-[#6FAE9C]">
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
                                  {new Date(interest.createdAt).toLocaleString(
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

                            <div className="flex md:w-1/3 md:flex-col md:justify-center">
                              <button
                                type="button"
                                aria-expanded={openContactId === interest.id}
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
                                    ? "flex flex-wrap gap-2 md:flex-col"
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
                                  Os links abrem o aplicativo escolhido; nenhuma
                                  mensagem é enviada automaticamente.
                                </p>
                              </div>
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
    </div>
  )
}
