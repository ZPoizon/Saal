import type {
  AdoptionReversalTarget,
  ConfirmAdoptionInput,
  RegularizeLegacyAdoptionInput,
} from "./animals"

export type AdoptionFieldErrors = Partial<Record<"adopterName" | "adopterPhone" | "adopterEmail" | "adoptionDate" | "notes", string>>

export type ReversalFieldErrors = Partial<Record<"reason", string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MAX_NAME_LENGTH = 120
const MAX_CONTACT_LENGTH = 160
const MAX_NOTES_LENGTH = 2000
const MIN_REVERSAL_REASON_LENGTH = 5

/** Valor de `<input type="date">` para a data local de hoje. */
export function todayDateInputValue(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

/** Data de calendário válida no formato `YYYY-MM-DD`. */
export function isValidCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split("-").map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

/**
 * Converte a data escolhida (sem horário) em ISO UTC. A janela de 30 dias é
 * sempre calculada a partir desse valor persistido em `adopted_at`.
 */
export function adoptionDateToIso(value: string): string {
  return `${value}T00:00:00.000Z`
}

export function validateAdoptionDate(
  value: string,
  now: Date = new Date(),
): string | undefined {
  if (!value) return "Informe a data real da adoção."

  if (!isValidCalendarDate(value)) return "Informe uma data válida."

  if (value > todayDateInputValue(now)) {
    return "A data da adoção não pode estar no futuro."
  }

  return undefined
}

function contactIsEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === ""
}

/** Validação compartilhada pelo modal e pelo serviço de confirmação. */
export function validateConfirmAdoptionInput(
  input: ConfirmAdoptionInput,
  now: Date = new Date(),
): AdoptionFieldErrors {
  const errors: AdoptionFieldErrors = {}

  const name = input.adopterName.trim()

  if (!name) {
    errors.adopterName = "Informe o nome do adotante."
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.adopterName = `O nome deve ter até ${MAX_NAME_LENGTH} caracteres.`
  }

  const email = input.adopterEmail?.trim() ?? ""

  if (
    email &&
    (!EMAIL_PATTERN.test(email) || email.length > MAX_CONTACT_LENGTH)
  ) {
    errors.adopterEmail = "Informe um e-mail válido."
  }

  const phone = input.adopterPhone?.trim() ?? ""

  if (phone && phone.length > MAX_CONTACT_LENGTH) {
    errors.adopterPhone = `O telefone deve ter até ${MAX_CONTACT_LENGTH} caracteres.`
  }

  const dateError = validateAdoptionDate(input.adoptionDate, now)

  if (dateError) errors.adoptionDate = dateError

  const notes = input.notes?.trim() ?? ""

  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `As observações devem ter até ${MAX_NOTES_LENGTH} caracteres.`
  }

  if (input.origin === "site" && input.interestId === null) {
    errors.adopterName =
      "Uma adoção de origem no site precisa estar vinculada a uma manifestação."
  }

  if (
    input.origin === "external" &&
    contactIsEmpty(email) &&
    contactIsEmpty(phone)
  ) {
    errors.adopterPhone = "Informe ao menos um contato (telefone ou e-mail)."
  }

  return errors
}

/**
 * Regularização legada não exige telefone/e-mail: os dados de contato do
 * histórico antigo podem não existir. Nome, data real e observações seguem as
 * mesmas regras da confirmação.
 */
export function validateRegularizeLegacyAdoptionInput(
  input: RegularizeLegacyAdoptionInput,
  now: Date = new Date(),
): AdoptionFieldErrors {
  const errors: AdoptionFieldErrors = {}
  const name = input.adopterName.trim()

  if (!name) {
    errors.adopterName = "Informe o nome do adotante."
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.adopterName = `O nome deve ter até ${MAX_NAME_LENGTH} caracteres.`
  }

  const dateError = validateAdoptionDate(input.adoptionDate, now)

  if (dateError) errors.adoptionDate = dateError

  const notes = input.notes?.trim() ?? ""

  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `As observações devem ter até ${MAX_NOTES_LENGTH} caracteres.`
  }

  return errors
}

export function validateReversalInput(
  reason: string,
  targetStatus: AdoptionReversalTarget,
): ReversalFieldErrors {
  const errors: ReversalFieldErrors = {}

  if (reason.trim().length < MIN_REVERSAL_REASON_LENGTH) {
    errors.reason = `Descreva o motivo com ao menos ${MIN_REVERSAL_REASON_LENGTH} caracteres.`
  }

  if (targetStatus !== "available" && targetStatus !== "treatment") {
    errors.reason = "Escolha um status válido para o animal."
  }

  return errors
}

export function hasFieldErrors(errors: object): boolean {
  return Object.keys(errors).length > 0
}
