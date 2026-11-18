import { useState } from "react"

import { AlertTriangle } from "lucide-react"

import type {
  AdoptionRecord,
  AdoptionReversalTarget,
  Animal,
} from "../../data/animals"
import { formatAdoptionDate } from "../../data/animals"
import {
  hasFieldErrors,
  validateReversalInput,
} from "../../data/adoption-validation"
import {
  AdoptionApiError,
  reverseAdoption,
} from "../../services/supabase-adoptions"

import { AdminModal } from "./AdminModal"

interface AdoptionReversalModalProps {
  adoption: AdoptionRecord
  animal: Animal | null
  onClose: () => void
  onReversed: (adoption: AdoptionRecord) => void
}

const inputClassName =
  "w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"

function errorMessage(error: unknown): string {
  if (error instanceof AdoptionApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Sua sessão não tem permissão para reverter a adoção. Entre novamente."
    }

    if (error.status === 400) return error.message

    if (error.status === 409) {
      return "Esta adoção não pode ser revertida no estado atual. Atualize a página."
    }
  }

  return "Não foi possível reverter a adoção. Verifique a conexão e tente novamente."
}

export function AdoptionReversalModal({
  adoption,
  animal,
  onClose,
  onReversed,
}: AdoptionReversalModalProps) {
  const [reason, setReason] = useState("")
  const [targetStatus, setTargetStatus] =
    useState<AdoptionReversalTarget>("available")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (submitting) return

    const validation = validateReversalInput(reason, targetStatus)

    if (hasFieldErrors(validation)) {
      setError(validation.reason ?? "Revise o motivo informado.")
      return
    }

    setError("")
    setSubmitting(true)

    try {
      const updated = await reverseAdoption({
        adoptionId: adoption.id,
        reason,
        targetStatus,
      })
      onReversed(updated)
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title="Reverter adoção"
      titleId="reversal-adoption-title"
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
        <div className="flex items-start gap-3 rounded-xl border border-[#E4B04A]/60 bg-[#F5EFE6] px-4 py-3 text-sm text-[#416f65]">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-[#E4B04A]"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-[#2E7D6B]">
              {adoption.animalName}
            </p>
            <p>
              Adoção registrada em {formatAdoptionDate(adoption.adoptionDate)}.
              O histórico será mantido e o animal voltará ao status escolhido.
            </p>
            {adoption.cleanupStatus === "completed" && (
              <p className="mt-2 font-semibold text-[#6b4e12]">
                As fotos desta adoção já foram removidas. Será necessário
                cadastrar novas fotos depois da reversão.
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="reversal-target"
            className="mb-2 block text-[#2E7D6B]"
          >
            Novo status do animal *
          </label>
          <select
            id="reversal-target"
            value={targetStatus}
            onChange={(event) =>
              setTargetStatus(event.target.value as AdoptionReversalTarget)
            }
            disabled={submitting}
            className={inputClassName}
          >
            <option value="available">Disponível</option>
            <option value="treatment">Em tratamento</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="reversal-reason"
            className="mb-2 block text-[#2E7D6B]"
          >
            Motivo da reversão *
          </label>
          <textarea
            id="reversal-reason"
            rows={4}
            required
            minLength={5}
            maxLength={2000}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={submitting}
            placeholder="Ex.: devolução pelo adotante, adoção cancelada após entrevista…"
            className={`${inputClassName} resize-none`}
          />
          {animal && (
            <p className="mt-1 text-xs text-[#6FAE9C]">
              Animal atual: {animal.name} — {animal.status}.
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
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
            className="min-h-11 flex-1 rounded-full bg-[#2E7D6B] py-3 font-semibold text-white transition-colors hover:bg-[#6FAE9C] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
          >
            {submitting ? "Revertendo…" : "Reverter adoção"}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
