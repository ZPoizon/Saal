import { useState } from "react"

import { AlertCircle } from "lucide-react"

import type { AdoptionRecord, Animal } from "../../data/animals"
import {
  hasFieldErrors,
  todayDateInputValue,
  validateRegularizeLegacyAdoptionInput,
  type AdoptionFieldErrors,
} from "../../data/adoption-validation"
import {
  AdoptionApiError,
  regularizeLegacyAdoption,
} from "../../services/supabase-adoptions"

import { AdminModal } from "./AdminModal"

interface LegacyAdoptionModalProps {
  animal: Animal
  onClose: () => void
  onRegularized: (adoption: AdoptionRecord) => void
}

const inputClassName =
  "w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"

function errorMessage(error: unknown): string {
  if (error instanceof AdoptionApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Sua sessão não tem permissão para regularizar a adoção. Entre novamente."
    }

    if (error.status === 400) return error.message

    if (error.status === 409) {
      return "Este animal já possui data de adoção registrada. Atualize a página."
    }
  }

  return "Não foi possível regularizar a adoção. Verifique a conexão e tente novamente."
}

export function LegacyAdoptionModal({
  animal,
  onClose,
  onRegularized,
}: LegacyAdoptionModalProps) {
  const [adoptionDate, setAdoptionDate] = useState("")
  const [adopterName, setAdopterName] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<AdoptionFieldErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (submitting) return

    setSubmitError("")

    const validation = validateRegularizeLegacyAdoptionInput({
      animalId: animal.id,
      adopterName,
      adoptionDate,
      notes,
    })

    setErrors(validation)

    if (hasFieldErrors(validation)) return

    setSubmitting(true)

    try {
      const adoption = await regularizeLegacyAdoption({
        animalId: animal.id,
        adoptionDate,
        adopterName,
        notes,
      })
      onRegularized(adoption)
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title="Regularizar adoção legada"
      titleId="regularize-adoption-title"
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
        <p className="rounded-xl border border-[#6FAE9C]/60 bg-[#2E7D6B]/5 px-4 py-3 text-sm text-[#416f65]">
          <strong>{animal.name}</strong> está marcado como adotado, mas não tem
          data real registrada. Nenhuma contagem retroativa foi iniciada e as
          fotos não serão apagadas automaticamente. Informe a data real somente
          se ela for conhecida.
        </p>

        <div>
          <label
            htmlFor="legacy-adoption-date"
            className="mb-2 block text-[#2E7D6B]"
          >
            Data real da adoção *
          </label>
          <input
            id="legacy-adoption-date"
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
          <label
            htmlFor="legacy-adopter-name"
            className="mb-2 block text-[#2E7D6B]"
          >
            Nome do adotante *
          </label>
          <input
            id="legacy-adopter-name"
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

        <div>
          <label
            htmlFor="legacy-adoption-notes"
            className="mb-2 block text-[#2E7D6B]"
          >
            Observações
          </label>
          <textarea
            id="legacy-adoption-notes"
            rows={3}
            maxLength={2000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={submitting}
            className={`${inputClassName} resize-none`}
          />
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
            {submitting ? "Salvando…" : "Regularizar adoção"}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
