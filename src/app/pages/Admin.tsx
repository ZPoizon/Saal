import { useEffect, useRef, useState } from "react"

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
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../services/admin-auth"

import { mockAnimals, Animal } from "../data/animals"

import logoSaal from "../../imports/logo_fundo_0.png"

import { AnimalForm } from "../components/admin/AnimalForm"

import { useInterest } from "../contexts/InterestContext"

import { buildInterestContactLinks } from "../utils/contact-links"

function authenticationErrorMessage(error: unknown): string {
  if (error instanceof AdminAuthError) {
    if (error.status === 401) return "Usuário ou senha inválidos."

    if (error.status === 403) {
      return "A sessão de segurança expirou. Tente novamente."
    }

    if (error.status === 429) {
      return "Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente."
    }
  }

  return "Não foi possível validar a autenticação. Verifique a conexão e tente novamente."
}

export function Admin() {
  const [authStatus, setAuthStatus] =
    useState<"checking" | "anonymous" | "authenticated" | "error">("checking")

  const [credentials, setCredentials] = useState({ username: "", password: "" })

  const [authMessage, setAuthMessage] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [animals, setAnimals] = useState<Animal[]>(mockAnimals)

  const [showForm, setShowForm] = useState(false)

  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)

  const [openContactId, setOpenContactId] = useState<string | null>(null)

  const ownedPreviewUrls = useRef(new Set<string>())

  const { interests } = useInterest()

  useEffect(() => {
    let active = true

    getAdminSession()

      .then((authenticated) => {
        if (!active) return

        setAuthStatus(authenticated ? "authenticated" : "anonymous")
      })

      .catch(() => {
        if (!active) return

        setAuthStatus("error")

        setAuthMessage(
          "Não foi possível validar a sessão. O painel permanece bloqueado.",
        )
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (authStatus !== "authenticated") return

    const verifySession = () => {
      if (document.visibilityState !== "visible") return

      getAdminSession()

        .then((authenticated) => {
          if (!authenticated) {
            setAuthStatus("anonymous")

            setAuthMessage("Sessão expirada. Entre novamente.")
          }
        })

        .catch(() => {
          setAuthStatus("error")

          setAuthMessage(
            "Não foi possível validar a sessão. O painel permanece bloqueado.",
          )
        })
    }

    window.addEventListener("focus", verifySession)

    document.addEventListener("visibilitychange", verifySession)

    return () => {
      window.removeEventListener("focus", verifySession)

      document.removeEventListener("visibilitychange", verifySession)
    }
  }, [authStatus])

  useEffect(() => {
    return () => {
      ownedPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url))

      ownedPreviewUrls.current.clear()
    }
  }, [])

  const retrySessionCheck = async () => {
    setAuthStatus("checking")

    setAuthMessage(null)

    try {
      const authenticated = await getAdminSession()

      setAuthStatus(authenticated ? "authenticated" : "anonymous")
    } catch {
      setAuthStatus("error")

      setAuthMessage(
        "Não foi possível validar a sessão. O painel permanece bloqueado.",
      )
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    setAuthMessage(null)

    try {
      await loginAdmin(credentials.username, credentials.password)

      setCredentials((current) => ({ ...current, password: "" }))

      setAuthStatus("authenticated")
    } catch (error) {
      setAuthStatus("anonymous")

      setAuthMessage(authenticationErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setIsSubmitting(true)

    setAuthMessage(null)

    try {
      await logoutAdmin()

      setAuthStatus("anonymous")

      setCredentials({ username: "", password: "" })
    } catch (error) {
      setAuthMessage(authenticationErrorMessage(error))
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

  const handleSaveAnimal = (animalData: Partial<Animal>) => {
    if (editingAnimal) {
      const nextImages = animalData.images ?? editingAnimal.images

      editingAnimal.images

        .filter(
          (image) => image.startsWith("blob:") && !nextImages.includes(image),
        )

        .forEach((image) => {
          URL.revokeObjectURL(image)

          ownedPreviewUrls.current.delete(image)
        })

      nextImages

        .filter((image) => image.startsWith("blob:"))

        .forEach((image) => ownedPreviewUrls.current.add(image))

      setAnimals((current) =>
        current.map((animal) =>
          animal.id === editingAnimal.id
            ? { ...animal, ...animalData }
            : animal,
        ),
      )
    } else {
      const newAnimal: Animal = {
        id: String(Date.now()),

        name: animalData.name!,

        species: animalData.species!,

        age: animalData.age!,

        size: animalData.size!,

        sex: animalData.sex!,

        status: animalData.status!,

        description: animalData.description!,

        personality: animalData.personality || [],

        medicalInfo: animalData.medicalInfo || "",

        images: animalData.images || [],
      }

      newAnimal.images

        .filter((image) => image.startsWith("blob:"))

        .forEach((image) => ownedPreviewUrls.current.add(image))

      setAnimals((current) => [newAnimal, ...current])
    }

    setShowForm(false)

    setEditingAnimal(null)
  }

  if (authStatus !== "authenticated") {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#2E7D6B] hover:text-[#E4B04A] mb-6 transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Voltar ao Início
          </Link>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center mb-8">
              <img
                src={logoSaal}
                alt="SAAL"
                className="w-20 h-20 mx-auto mb-4 object-contain"
              />
              <h1 className="text-3xl font-bold text-[#2E7D6B] mb-2">
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
                  className="text-sm font-semibold text-[#2E7D6B] underline"
                >
                  Tentar validar novamente
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
                className="w-full bg-[#2E7D6B] text-white py-3 rounded-full font-semibold hover:bg-[#6FAE9C] transition-all shadow-md hover:shadow-lg"
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
    <div className="min-h-screen bg-[#F5EFE6] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D6B] mb-2">
              Painel Administrativo
            </h1>
            <p className="text-[#6FAE9C]">Gerencie os animais e interessados</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isSubmitting}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
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

        <p
          role="status"
          className="mb-6 rounded-xl border border-[#E4B04A]/50 bg-white px-4 py-3 text-sm text-[#416f65]"
        >
          Protótipo: alterações ficam somente nesta sessão. Fotos escolhidas são
          prévias locais e não são enviadas ao servidor.
        </p>

        <nav
          aria-label="Navegação administrativa"
          className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-md"
        >
          <a
            href="#animals"
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
          >
            Animais
          </a>
          <a
            href="#interests"
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
          >
            Interessados
          </a>
          <button
            type="button"
            disabled
            title="Disponível quando a área de configurações for aprovada e implementada"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-400"
          >
            <Settings size={16} />
            Configurações
          </button>
        </nav>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Total de Animais</span>
              <PawPrint className="text-[#E4B04A]" size={20} />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {animals.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Disponíveis</span>
              <Heart className="text-[#2E7D6B]" size={20} />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {animals.filter((a) => a.status === "available").length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Adotados</span>
              <Heart className="text-green-500" size={20} fill="currentColor" />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {animals.filter((a) => a.status === "adopted").length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Solicitações</span>
              <Mail className="text-[#E4B04A]" size={20} />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {interests.length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <button
            onClick={handleAddAnimal}
            className="bg-[#E4B04A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4a03a] transition-colors flex items-center gap-2"
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-[#F5EFE6]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Foto</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Nome</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">
                    Espécie
                  </th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Idade</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Status</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFE6]">
                {animals.map((animal) => (
                  <tr
                    key={animal.id}
                    className="hover:bg-[#F5EFE6]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={
                          animal.images[0]?.startsWith("blob:")
                            ? animal.images[0]
                            : animal.images[0]
                              ? `${animal.images[0]}?w=60&h=60&fit=crop`
                              : "https://via.placeholder.com/60"
                        }
                        alt={animal.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#2E7D6B]">
                      {animal.name}
                    </td>
                    <td className="px-6 py-4 text-[#6FAE9C]">
                      {animal.species === "dog" ? "Cachorro" : "Gato"}
                    </td>
                    <td className="px-6 py-4 text-[#6FAE9C]">{animal.age}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAnimal(animal)}
                          className="p-2 text-[#2E7D6B] hover:bg-[#F5EFE6] rounded-lg transition-colors"
                          aria-label={`Editar ${animal.name}`}
                        >
                          <Edit size={18} />
                        </button>
                      </div>
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
          <div className="p-6 border-b border-[#F5EFE6]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2E7D6B] flex items-center gap-2">
                <Mail size={20} className="text-[#E4B04A]" />
                Solicitações de Adoção
              </h2>
              <span className="bg-[#E4B04A] text-white px-3 py-1 rounded-full text-sm font-semibold">
                {interests.length} registros
              </span>
            </div>
          </div>
          <div className="p-6">
            {interests.length === 0 ? (
              <p className="text-[#6FAE9C] text-center py-8">
                Nenhum dado de solicitação está disponível nesta demonstração. A
                lista ainda não está conectada ao backend.
              </p>
            ) : (
              <div className="space-y-4">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    className="rounded-xl border border-[#E4B04A]/60 bg-[#E4B04A]/5 p-4"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Animal Info */}
                      <div className="flex items-center gap-3 md:w-1/3">
                        <img
                          src={`${interest.animalImage}?w=60&h=60&fit=crop`}
                          alt={interest.animalName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-[#2E7D6B]">
                            {interest.animalName}
                          </p>
                          <p className="text-xs text-[#6FAE9C]">
                            {new Date(interest.date).toLocaleDateString(
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

                      {/* Person Info */}
                      <div className="flex-1 md:w-1/3">
                        <p className="font-semibold text-[#2E7D6B]">
                          {interest.name}
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

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 md:w-1/3 md:justify-center">
                        <button
                          type="button"
                          aria-expanded={openContactId === interest.id}
                          aria-controls={`contact-actions-${interest.id}`}
                          onClick={() =>
                            setOpenContactId((current) =>
                              current === interest.id ? null : interest.id,
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
                          {(() => {
                            const links = buildInterestContactLinks(interest)

                            return (
                              <>
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
                              </>
                            )
                          })()}
                          <p className="w-full text-xs text-gray-500">
                            Os links abrem o aplicativo escolhido; nenhuma
                            mensagem é enviada automaticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
