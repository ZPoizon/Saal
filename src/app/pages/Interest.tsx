import { useParams, Link, useNavigate } from "react-router"

import { ArrowLeft, Heart } from "lucide-react"

import { useRef, useState } from "react"

import { useAsync } from "../hooks/useAsync"

import { AnimalApiError, getPublicAnimal } from "../services/supabase-animals"

import {
  InterestApiError,
  submitAnimalInterest,
} from "../services/supabase-interests"

import { validateInterestForm } from "../utils/interest-validation"

import { SafeImage } from "../components/SafeImage"

import { useSiteSettings } from "../contexts/SiteSettingsContext"

export function Interest() {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const { settings } = useSiteSettings()

  const {
    data: animal,

    status,

    error,

    reload,
  } = useAsync(`animal-${id ?? ""}`, () =>
    id ? getPublicAnimal(id) : Promise.reject(new AnimalApiError(404)),
  )

  const [formData, setFormData] = useState({
    name: "",

    email: "",

    whatsapp: "",

    city: "",
  })

  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<"name" | "whatsapp" | "city" | "email", string>>>(
      {},
    )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [submissionSucceeded, setSubmissionSucceeded] = useState(false)

  const [submissionFailed, setSubmissionFailed] = useState(false)

  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null,
  )

  const submissionLock = useRef(false)

  if (status === "loading") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-[#F5EFE6] px-4 py-12">
        <p role="status" className="text-[#2E7D6B]">
          Carregando animal…
        </p>
      </div>
    )
  }

  if (status === "error" || !animal) {
    const notFound = error instanceof AnimalApiError && error.status === 404

    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-[#F5EFE6] px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2E7D6B] mb-4">
            {notFound
              ? "Animal não encontrado"
              : "Não foi possível carregar este animal"}
          </h2>
          {notFound ? (
            <Link
              to="/animais"
              className="inline-flex min-h-11 items-center text-[#E4B04A] hover:underline"
            >
              Voltar para lista de animais
            </Link>
          ) : (
            <button
              type="button"
              onClick={reload}
              className="inline-flex min-h-11 items-center text-[#E4B04A] hover:underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  if (animal.status === "adopted") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-[#F5EFE6] px-4 py-12">
        <div className="max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
          <Heart className="mx-auto mb-4 h-12 w-12 fill-current text-[#E4B04A]" />
          <h1 className="mb-3 text-2xl font-bold text-[#2E7D6B]">
            Este animal já encontrou um lar!
          </h1>
          <p className="mb-6 text-gray-600">
            {animal.name} foi adotado e não recebe novas manifestações de
            interesse. Conheça outros animais disponíveis.
          </p>
          <Link
            to="/animais"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2E7D6B] px-6 font-semibold text-white hover:bg-[#6FAE9C]"
          >
            Ver animais disponíveis
          </Link>
        </div>
      </div>
    )
  }

  if (animal.status === "treatment") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-[#F5EFE6] px-4 py-12">
        <div className="max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
          <Heart className="mx-auto mb-4 h-12 w-12 text-[#2E7D6B]" />
          <h1 className="mb-3 text-2xl font-bold text-[#2E7D6B]">
            {animal.name} está em tratamento
          </h1>
          <p className="mb-6 text-gray-600">
            Este animal ainda não recebe manifestações de interesse. Conheça
            outros animais disponíveis e volte em breve.
          </p>
          <Link
            to="/animais"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2E7D6B] px-6 font-semibold text-white hover:bg-[#6FAE9C]"
          >
            Ver animais
          </Link>
        </div>
      </div>
    )
  }

  if (!settings.adoption.acceptingInterests) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-[#F5EFE6] px-4 py-12">
        <div className="max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
          <Heart className="mx-auto mb-4 h-12 w-12 text-[#E4B04A]" />
          <h1 className="mb-3 text-2xl font-bold text-[#2E7D6B]">
            Recebimento de interesses pausado
          </h1>
          <p className="mb-6 text-gray-600">
            No momento, não estamos recebendo novas manifestações.
          </p>
          <Link
            to="/animais"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2E7D6B] px-6 font-semibold text-white hover:bg-[#6FAE9C]"
          >
            Voltar aos animais
          </Link>
        </div>
      </div>
    )
  }

  const animalUnavailableMessage =
    "Este animal não está disponível para receber manifestações de interesse."

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((current) => ({ ...current, [name]: value }))

    setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submissionLock.current || submissionSucceeded) return

    const errors = validateInterestForm({
      fullName: formData.name,

      whatsapp: formData.whatsapp,

      city: formData.city,

      email: formData.email,
    })

    setFieldErrors({
      name: errors.fullName,

      whatsapp: errors.whatsapp,

      city: errors.city,

      email: errors.email,
    })

    setSubmissionMessage(null)

    setSubmissionFailed(false)

    if (Object.keys(errors).length > 0) return

    submissionLock.current = true

    setIsSubmitting(true)

    try {
      const receipt = await submitAnimalInterest(animal.id, {
        fullName: formData.name,

        whatsapp: formData.whatsapp,

        city: formData.city,

        email: formData.email,
      })

      if (!receipt.received) {
        throw new Error("A API não confirmou o recebimento.")
      }

      setSubmissionSucceeded(true)

      setSubmissionMessage(settings.adoption.submissionMessage)
    } catch (error) {
      const status = error instanceof InterestApiError ? error.status : null

      setSubmissionFailed(true)

      setSubmissionMessage(
        status === 409
          ? "Este animal não está mais disponível para receber manifestações."
          : status === 429
            ? "Não foi possível registrar agora. Tente novamente mais tarde."
            : status === 400
              ? "Revise os dados informados e tente novamente."
              : "Não foi possível enviar sua manifestação. Seus dados permanecem no formulário; tente novamente.",
      )
    } finally {
      submissionLock.current = false

      setIsSubmitting(false)
    }
  }

  const animalAvailable = animal.status === "available"

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-[#2E7D6B] transition-colors hover:text-[#E4B04A]"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <Heart
              className="mx-auto mb-4 h-12 w-12 text-[#E4B04A] sm:h-16 sm:w-16"
              fill="#E4B04A"
            />
            <h1 className="mb-3 text-2xl font-bold text-[#2E7D6B] sm:text-3xl md:text-4xl">
              Manifestar Interesse
            </h1>
            <p className="text-[#6FAE9C]">
              Preencha o formulário abaixo para demonstrar interesse em adotar{" "}
              <strong>{animal.name}</strong>
            </p>
          </div>

          <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-[#F5EFE6] pb-6 sm:gap-4">
              <SafeImage
                src={animal.images[0]}
                alt={animal.name}
                params={{ w: 100, h: 100, fit: "crop" }}
                className="h-16 w-16 shrink-0 rounded-xl object-cover [image-orientation:from-image] sm:h-20 sm:w-20"
              />
              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold text-[#2E7D6B]">
                  {animal.name}
                </h3>
                <p className="text-sm text-[#6FAE9C]">
                  {animal.species === "dog" ? "Canino" : "Felino"} •{" "}
                  {animal.age} • {animal.sex}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
              aria-describedby="interest-form-status"
            >
              <div>
                <label htmlFor="name" className="block text-[#2E7D6B] mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  disabled={
                    !animalAvailable || isSubmitting || submissionSucceeded
                  }
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Seu nome completo"
                />
                {fieldErrors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="mt-1 text-sm text-red-700"
                  >
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-[#2E7D6B] mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  required
                  maxLength={32}
                  autoComplete="tel"
                  aria-invalid={Boolean(fieldErrors.whatsapp)}
                  aria-describedby={
                    fieldErrors.whatsapp ? "whatsapp-error" : undefined
                  }
                  disabled={
                    !animalAvailable || isSubmitting || submissionSucceeded
                  }
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="(11) 99999-9999"
                />
                {fieldErrors.whatsapp && (
                  <p
                    id="whatsapp-error"
                    role="alert"
                    className="mt-1 text-sm text-red-700"
                  >
                    {fieldErrors.whatsapp}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-[#2E7D6B] mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  maxLength={120}
                  autoComplete="address-level2"
                  aria-invalid={Boolean(fieldErrors.city)}
                  aria-describedby={fieldErrors.city ? "city-error" : undefined}
                  disabled={
                    !animalAvailable || isSubmitting || submissionSucceeded
                  }
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Sua cidade"
                />
                {fieldErrors.city && (
                  <p
                    id="city-error"
                    role="alert"
                    className="mt-1 text-sm text-red-700"
                  >
                    {fieldErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-[#2E7D6B] mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  maxLength={160}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  disabled={
                    !animalAvailable || isSubmitting || submissionSucceeded
                  }
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="seu.email@exemplo.com"
                />
                {fieldErrors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1 text-sm text-red-700"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <p
                id="interest-form-status"
                role={submissionFailed ? "alert" : "status"}
                aria-live={submissionFailed ? "assertive" : "polite"}
                className={`rounded-lg border p-3 text-sm ${
                  submissionFailed
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-[#E4B04A]/50 bg-[#F5EFE6] text-[#416f65]"
                }`}
              >
                {!animalAvailable
                  ? animalUnavailableMessage
                  : (submissionMessage ??
                    "A manifestação será registrada para avaliação manual da equipe. O envio não confirma a adoção.")}
              </p>
              {animalAvailable && (
                <button
                  type="submit"
                  disabled={isSubmitting || submissionSucceeded}
                  className="min-h-11 w-full rounded-full bg-[#E4B04A] py-4 font-semibold text-white shadow-md transition-all hover:bg-[#d4a03a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Enviando…"
                    : submissionSucceeded
                      ? "Manifestação recebida"
                      : "Enviar manifestação"}
                </button>
              )}
            </form>
          </div>

          <div className="bg-[#2E7D6B]/10 border border-[#2E7D6B] rounded-xl p-4 text-sm text-[#2E7D6B]">
            <p>
              <strong>Importante:</strong> A manifestação não aprova a adoção. A
              avaliação é feita manualmente pela equipe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
