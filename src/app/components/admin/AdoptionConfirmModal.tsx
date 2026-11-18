import { useMemo, useState } from "react"

import { AlertCircle } from "lucide-react"

import type {
  AdoptionOrigin,
  AdoptionRecord,
  Animal,
  ConfirmAdoptionInput,
} from "../../data/animals"
import type { AdminAnimalInterest } from "../../data/interests"
import {
  hasFieldErrors,
  todayDateInputValue,
  validateConfirmAdoptionInput,
  type AdoptionFieldErrors,
} from "../../data/adoption-validation"
import {
  AdoptionApiError,
  confirmAdoption,
} from "../../services/supabase-adoptions"

import { AdminModal } from "./AdminModal"

interface AdoptionConfirmModalProps {
  animal: Animal
  interests: AdminAnimalInterest[]
  initialInterestId?: string | null
  onClose: () => void
  onConfirmed: (adoption: AdoptionRecord) => void
}

const inputClassName =
  "w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"

function errorMessage(error: unknown): string {
  if (error instanceof AdoptionApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Sua sessão não tem permissão para confirmar a adoção. Entre novamente."
    }

    if (error.status === 400) return error.message

    if (error.status === 409) {
      return "Este animal já possui uma adoção ativa. Atualize a página para conferir o histórico."
    }
  }

  return "Não foi possível confirmar a adoção. Verifique a conexão e tente novamente."
}

export function AdoptionConfirmModal({
  animal,
  interests,
  initialInterestId = null,
  onClose,
  onConfirmed,
}: AdoptionConfirmModalProps) {
  const availableInterests = useMemo(
    () => interests.filter((interest) => interest.animalId === animal.id),
    [interests, animal.id],
  )

  const initialInterest =
    availableInterests.find((interest) => interest.id === initialInterestId) ??
    null

  const [origin, setOrigin] = useState<AdoptionOrigin>(
    initialInterest ? "site" : "external",
  )
  const [interestId, setInterestId] = useState<string | null>(
    initialInterest?.id ?? null,
  )
  const [adopterName, setAdopterName] = useState(
    initialInterest?.fullName ?? "",
  )
  const [adopterPhone, setAdopterPhone] = useState(
    initialInterest?.whatsapp ?? "",
  )
  const [adopterEmail, setAdopterEmail] = useState(initialInterest?.email ?? "")
  const [adoptionDate, setAdoptionDate] = useState(todayDateInputValue())
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<AdoptionFieldErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selectInterest = (value: string) => {
    setInterestId(value || null)

    const selected = availableInterests.find(
      (interest) => interest.id === value,
    )

    if (!selected) return

    setAdopterName(selected.fullName)
    setAdopterPhone(selected.whatsapp)
    setAdopterEmail(selected.email)
  }

  const buildInput = (): ConfirmAdoptionInput => ({
    animalId: animal.id,
    interestId: origin === "site" ? interestId : null,
    origin,
    adopterName,
    adopterPhone,
    adopterEmail,
    adoptionDate,
    notes,
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (submitting) return

    setSubmitError("")

    const input = buildInput()
    const validation = validateConfirmAdoptionInput(input)

    setErrors(validation)

    if (hasFieldErrors(validation)) return

    setSubmitting(true)

    try {
      const adoption = await confirmAdoption(input)
      onConfirmed(adoption)
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title="Confirmar adoção"
      titleId="confirm-adoption-title"
      onClose={onClose}
      maxWidthClassName="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
        <p className="rounded-xl border border-[#E4B04A]/50 bg-[#F5EFE6] px-4 py-3 text-sm text-[#416f65]">
          A confirmação registra o histórico e grava a data real da adoção em{" "}
          <strong>{animal.name}</strong>. A janela de 30 dias para as fotos
          começa nessa data, nunca em <code>updated_at</code>.
        </p>

        <fieldset>
          <legend className="mb-2 font-semibold text-[#2E7D6B]">
            Origem da adoção
          </legend>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#F5EFE6] px-4 py-2 text-sm font-semibold text-[#2E7D6B]">
              <input
                type="radio"
                name="origin"
                value="site"
                checked={origin === "site"}
                onChange={() => setOrigin("site")}
                disabled={submitting}
              />
              Manifestação pelo site
            </label>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#F5EFE6] px-4 py-2 text-sm font-semibold text-[#2E7D6B]">
              <input
                type="radio"
                name="origin"
                value="external"
                checked={origin === "external"}
                onChange={() => setOrigin("external")}
                disabled={submitting}
              />
              Adoção externa
            </label>
          </div>
        </fieldset>

        {origin === "site" && (
          <div>
            <label
              htmlFor="adoption-interest"
              className="mb-2 block text-[#2E7D6B]"
            >
              Manifestação vinculada *
            </label>
            <select
              id="adoption-interest"
              value={interestId ?? ""}
              onChange={(event) => selectInterest(event.target.value)}
              disabled={submitting}
              className={inputClassName}
            >
              <option value="">Selecione uma manifestação</option>
              {availableInterests.map((interest) => (
                <option key={interest.id} value={interest.id}>
                  {interest.fullName} — {interest.city}
                </option>
              ))}
            </select>
            {availableInterests.length === 0 && (
              <p className="mt-1 text-sm text-[#6FAE9C]">
                Não há manifestações registradas para este animal. Use a origem
                externa ou registre a adoção sem vínculo.
              </p>
            )}
            {errors.adopterName && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errors.adopterName}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="adopter-name" className="mb-2 block text-[#2E7D6B]">
            Nome do adotante *
          </label>
          <input
            id="adopter-name"
            type="text"
            required
            maxLength={120}
            value={adopterName}
            onChange={(event) => setAdopterName(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.adopterName)}
            className={inputClassName}
          />
          {errors.adopterName && (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {errors.adopterName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="adopter-phone"
              className="mb-2 block text-[#2E7D6B]"
            >
              Telefone
            </label>
            <input
              id="adopter-phone"
              type="tel"
              maxLength={160}
              value={adopterPhone}
              onChange={(event) => setAdopterPhone(event.target.value)}
              disabled={submitting}
              aria-invalid={Boolean(errors.adopterPhone)}
              className={inputClassName}
            />
            {errors.adopterPhone && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errors.adopterPhone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="adopter-email"
              className="mb-2 block text-[#2E7D6B]"
            >
              E-mail
            </label>
            <input
              id="adopter-email"
              type="email"
              maxLength={160}
              value={adopterEmail}
              onChange={(event) => setAdopterEmail(event.target.value)}
              disabled={submitting}
              aria-invalid={Boolean(errors.adopterEmail)}
              className={inputClassName}
            />
            {errors.adopterEmail && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errors.adopterEmail}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="adoption-date" className="mb-2 block text-[#2E7D6B]">
            Data real da adoção *
          </label>
          <input
            id="adoption-date"
            type="date"
            required
            max={todayDateInputValue()}
            value={adoptionDate}
            onChange={(event) => setAdoptionDate(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.adoptionDate)}
            className={inputClassName}
          />
          {errors.adoptionDate && (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {errors.adoptionDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="adoption-notes" className="mb-2 block text-[#2E7D6B]">
            Observações
          </label>
          <textarea
            id="adoption-notes"
            rows={3}
            maxLength={2000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={submitting}
            className={`${inputClassName} resize-none`}
          />
          {errors.notes && (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {errors.notes}
            </p>
          )}
        </div>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="min-h-11 flex-1 rounded-full bg-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 flex-1 rounded-full bg-[#E4B04A] py-3 font-semibold text-white transition-colors hover:bg-[#d4a03a] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
          >
            {submitting ? "Confirmando…" : "Confirmar adoção"}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
