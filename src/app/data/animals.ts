export type AnimalStatus = "available" | "treatment" | "adopted"

export type AnimalSpecies = "dog" | "cat"

export type AnimalSize = "pequeno" | "médio" | "grande"

export type AnimalSex = "macho" | "fêmea"

export interface Animal {
  id: string
  name: string
  species: AnimalSpecies
  age: string
  size: AnimalSize
  sex: AnimalSex
  status: AnimalStatus
  description: string
  personality: string[]
  medicalInfo: string
  images: string[]
  adoptedAt: string | null
  archivedAt: string | null
}

/**
 * Dados aceitos para cadastro/edição. As fotos continuam sendo referências (URLs),
 * sem upload de arquivos: a API persiste os endereços informados.
 */
export interface AnimalInput {
  name: string
  species: AnimalSpecies
  age: string
  size: AnimalSize
  sex: AnimalSex
  status: AnimalStatus
  description: string
  personality: string[]
  medicalInfo: string
  images: string[]
}

// ============================================
// Adoption records
// ============================================

export type AdoptionOrigin = "site" | "external"

export type AdoptionCleanupStatus = "pending" | "scheduled" | "completed" | "failed" | "cancelled"

export interface AdoptionRecord {
  id: string
  animalId: string | null
  animalName: string
  animalSpecies: AnimalSpecies | null
  animalSex: AnimalSex | null
  animalSize: AnimalSize | null
  animalAge: string | null
  animalDescription: string | null
  animalMedicalInfo: string | null
  animalPersonality: string[] | null
  interestId: string | null
  origin: AdoptionOrigin
  adopterName: string
  adopterPhone: string | null
  adopterEmail: string | null
  adoptionDate: string
  notes: string | null
  confirmedBy: string | null
  confirmedAt: string
  createdAt: string
  reversedAt: string | null
  reversedBy: string | null
  reversalReason: string | null
  cleanupStatus: AdoptionCleanupStatus
  cleanupError: string | null
  cleanupAttemptedAt: string | null
  cleanupCompletedAt: string | null
}

/** Status de destino permitido ao reverter uma adoção confirmada. */
export type AdoptionReversalTarget = "available" | "treatment"

export interface ConfirmAdoptionInput {
  animalId: string
  interestId: string | null
  origin: AdoptionOrigin
  adopterName: string
  adopterPhone?: string | null
  adopterEmail?: string | null
  adoptionDate: string
  notes?: string | null
}

export interface ReverseAdoptionInput {
  adoptionId: string
  reason: string
  targetStatus: AdoptionReversalTarget
}

export interface RegularizeLegacyAdoptionInput {
  animalId: string
  adoptionDate: string
  adopterName: string
  notes?: string | null
}

// ============================================
// Ciclo de vida e janela de retenção das fotos
// ============================================

/** Janela, em dias, entre a adoção e a remoção definitiva das fotos. */
export const ADOPTION_PHOTO_RETENTION_DAYS = 30

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export const ADOPTION_PHOTO_RETENTION_MS =
  ADOPTION_PHOTO_RETENTION_DAYS * MILLISECONDS_PER_DAY

/** Converte uma data ISO válida em timestamp; `null` para valores inválidos. */
export function toLifecycleTimestamp(
  value: string | null | undefined,
): number | null {
  if (!value) return null

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? null : timestamp
}

/** Data real da adoção registrada; nunca derivada de `updated_at`. */
export function hasKnownAdoptionDate(
  animal: Pick<Animal, "adoptedAt">,
): boolean {
  return toLifecycleTimestamp(animal.adoptedAt) !== null
}

/** Limite (UTC) para remoção das fotos, ou `null` quando a data é desconhecida. */
export function getAdoptionPhotoDeadline(
  adoptedAt: string | null,
): Date | null {
  const timestamp = toLifecycleTimestamp(adoptedAt)

  if (timestamp === null) return null

  return new Date(timestamp + ADOPTION_PHOTO_RETENTION_MS)
}

/**
 * A janela termina no instante exato `adopted_at + 30 dias` em UTC.
 * Em 29 dias ainda não expirou; em 30 dias completos já expirou.
 */
export function isAdoptionPhotoWindowExpired(
  adoptedAt: string | null,
  now: Date = new Date(),
): boolean {
  const timestamp = toLifecycleTimestamp(adoptedAt)

  if (timestamp === null) return false

  return now.getTime() >= timestamp + ADOPTION_PHOTO_RETENTION_MS
}

/**
 * Animais adotados com data conhecida deixam o catálogo público ao fim da
 * janela, mesmo que a limpeza de arquivos ainda não tenha sido executada.
 * Adotados sem data (legado) permanecem visíveis e não iniciam contagem.
 */
export function isAnimalPubliclyVisible(
  animal: Pick<Animal, "status" | "adoptedAt">,
  now: Date = new Date(),
): boolean {
  if (animal.status !== "adopted") return true

  return !isAdoptionPhotoWindowExpired(animal.adoptedAt, now)
}

/** Somente animais disponíveis podem receber novas manifestações. */
export function canReceiveInterests(animal: Pick<Animal, "status">): boolean {
  return animal.status === "available"
}

/** Uma adoção só pode ser confirmada para animal ainda não adotado. */
export function canConfirmAdoption(animal: Pick<Animal, "status">): boolean {
  return animal.status === "available" || animal.status === "treatment"
}

/** Animais adotados só saem desse estado pelo fluxo de reversão. */
export function requiresAdoptionReversal(
  animal: Pick<Animal, "status">,
): boolean {
  return animal.status === "adopted"
}

/** Adotado legado: precisa de regularização administrativa da data real. */
export function isLegacyAdoption(
  animal: Pick<Animal, "status" | "adoptedAt">,
): boolean {
  return animal.status === "adopted" && !hasKnownAdoptionDate(animal)
}

/** Rótulos de status usados na interface pública e administrativa. */
export const ANIMAL_STATUS_LABELS: Record<AnimalStatus, string> = {
  available: "Disponível",
  treatment: "Em tratamento",
  adopted: "Adotado",
}

/** Status que podem ser escolhidos diretamente no formulário (sem RPC). */
export const EDITABLE_ANIMAL_STATUSES: readonly AnimalStatus[] = [
  "available",
  "treatment",
]

/** Formata a data de adoção para exibição em pt-BR. */
export function formatAdoptionDate(value: string | null): string {
  const timestamp = toLifecycleTimestamp(value)

  if (timestamp === null) return "Data não registrada"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp))
}
