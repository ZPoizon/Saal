// SAAL — Regras e orquestração da limpeza automática das fotos de adoções.
//
// Este módulo é usado pela Edge Function agendada `cleanup-adopted-photos` e
// pelos testes automatizados. Ele não acessa o Supabase diretamente: todas as
// operações externas entram por dependências injetadas, o que permite testar
// remoção, falha parcial e retentativa sem tocar em arquivos reais.
//
// Regras que nunca devem ser afrouxadas:
//   * a janela de 30 dias conta a partir da data real da adoção;
//   * adoção revertida, concluída ou sem data não é processada;
//   * o animal precisa continuar com status `adopted`;
//   * somente arquivos exclusivos do animal, no bucket `animal-photos`, são
//     removidos; fotos compartilhadas ou de endereço inválido exigem revisão;
//   * a remoção usa a API oficial do Storage, nunca SQL em `storage.objects`.

export const ANIMAL_PHOTO_BUCKET = "animal-photos"

export const ADOPTION_PHOTO_RETENTION_DAYS = 30

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export const ADOPTION_PHOTO_RETENTION_MS =
  ADOPTION_PHOTO_RETENTION_DAYS * MILLISECONDS_PER_DAY

export type AdoptionCleanupStatus = "pending" | "scheduled" | "completed" | "failed" | "cancelled"

export interface CleanupAnimal {
  id: string
  status: string
  images?: readonly string[]
}

export interface AnimalPhotoReference {
  animalId: string
  storagePath: string
}

export interface AdoptionCleanupCandidate {
  adoptionId: string
  animalId: string | null
  animalName: string
  adoptedAt: string | null
  cleanupStatus: AdoptionCleanupStatus
}

export type PhotoPathFailure = "external-url" | "wrong-bucket" | "invalid-path" | "invalid-url"

export interface ValidAnimalPhotoPath {
  ok: true
  bucket: string
  path: string
}

export interface InvalidAnimalPhotoPath {
  ok: false
  reason: PhotoPathFailure
}

export type PhotoPathResult = ValidAnimalPhotoPath | InvalidAnimalPhotoPath

export interface AnimalPhotoOwnership {
  /** Caminho no bucket -> ids dos animais que referenciam o arquivo. */
  animalsByPath: Map<string, Set<string>>
  /** Id do animal -> caminhos válidos encontrados. */
  referencesByAnimal: Map<string, string[]>
}

export interface CleanupPhotoReference {
  url: string
  path: string
}

export interface InvalidCleanupPhoto {
  url: string
  reason: PhotoPathFailure
}

export interface AdoptionPhotoCleanupPlan {
  adoptionId: string
  animalId: string | null
  animalName: string
  adoptedAt: string | null
  deadline: Date | null
  expired: boolean
  removable: CleanupPhotoReference[]
  shared: CleanupPhotoReference[]
  invalid: InvalidCleanupPhoto[]
}

export interface AdoptionPhotoRemovalResult {
  removed: string[]
  errors: string[]
}

export interface StorageListEntry {
  name: string
}

export interface StorageRemovalEvidence {
  /** Nomes devolvidos por `storage.remove` (pode vir vazio). */
  removedNames: readonly string[]
  /** Resultado de `storage.list` na pasta do arquivo. */
  listing: readonly StorageListEntry[]
}

export interface StorageRemovalConfirmation {
  confirmed: boolean
  reason: string | null
}

export interface AdoptionPhotoCleanupDependencies {
  listCandidates: (now: Date) => Promise<AdoptionCleanupCandidate[]>
  listAnimals: () => Promise<CleanupAnimal[]>
  listPhotoReferences: () => Promise<AnimalPhotoReference[]>
  removePaths: (paths: string[]) => Promise<AdoptionPhotoRemovalResult>
  recordCleanup: (
    adoptionId: string,
    status: AdoptionCleanupStatus,
    removedUrls: string[],
    error: string | null,
  ) => Promise<void>
}

export type AdoptionCleanupItemStatus = "completed" | "failed" | "skipped"

export interface AdoptionCleanupItemResult {
  adoptionId: string
  animalId: string | null
  animalName: string
  status: AdoptionCleanupItemStatus
  removedPaths: string[]
  reason: string | null
}

export interface AdoptionPhotoCleanupReport {
  checked: number
  completed: number
  failed: number
  skipped: number
  items: AdoptionCleanupItemResult[]
}

export interface AdoptionPhotoCleanupOptions {
  now?: Date
  supabaseUrl: string
}

const STORAGE_PATH_PATTERN =
  /^animals\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i

/** Converte uma data ISO em timestamp; `null` para valores ausentes/inválidos. */
export function toCleanupTimestamp(
  value: string | null | undefined,
): number | null {
  if (!value) return null

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? null : timestamp
}

/**
 * A janela termina exatamente em `adopted_at + 30 dias` (UTC).
 * Em 29 dias ainda não expirou; em 30 dias completos já expirou.
 */
export function isCleanupWindowExpired(
  adoptedAt: string | null,
  now: Date,
): boolean {
  const timestamp = toCleanupTimestamp(adoptedAt)

  if (timestamp === null) return false

  return now.getTime() >= timestamp + ADOPTION_PHOTO_RETENTION_MS
}

/** Valida rigorosamente um caminho do bucket `animal-photos`. */
export function isValidAnimalPhotoPath(path: string): boolean {
  if (path.includes("\\") || path.includes("\0")) return false

  const segments = path.split("/")

  if (segments.length !== 2) return false

  return STORAGE_PATH_PATTERN.test(path)
}

/** Nome do arquivo dentro da pasta `animals`, ou `null` para caminho inválido. */
export function animalPhotoFileName(path: string): string | null {
  if (!isValidAnimalPhotoPath(path)) return null

  const fileName = path.split("/").pop()

  return fileName && fileName.length > 0 ? fileName : null
}

/**
 * Confirma a exclusão física a partir de evidências da Storage API.
 *
 * `storage.remove` pode responder sem erro e sem devolver o objeto removido.
 * Nesse caso, a Edge Function consulta a pasta com `storage.list`; a remoção só
 * é considerada confirmada quando o nome não aparece mais no bucket. O banco
 * nunca deve receber `completed` baseado apenas no otimismo do cliente.
 */
export function confirmAnimalPhotoRemoval(
  path: string,
  evidence: StorageRemovalEvidence,
): StorageRemovalConfirmation {
  if (!isValidAnimalPhotoPath(path)) {
    return {
      confirmed: false,
      reason: "Caminho de foto inválido; exclusão não confirmada.",
    }
  }

  if (evidence.removedNames.includes(path)) {
    return { confirmed: true, reason: null }
  }

  const fileName = animalPhotoFileName(path)

  if (!fileName) {
    return {
      confirmed: false,
      reason:
        "Não foi possível identificar o arquivo para confirmar a exclusão.",
    }
  }

  if (evidence.listing.some((entry) => entry.name === fileName)) {
    return {
      confirmed: false,
      reason: `O Storage ainda lista ${path}; a remoção não foi confirmada.`,
    }
  }

  return { confirmed: true, reason: null }
}

/**
 * Extrai o caminho apenas de URLs públicas/assinadas do próprio projeto
 * Supabase. URLs externas ou de outro bucket são recusadas.
 */
export function parseAnimalPhotoUrl(
  url: string,
  supabaseUrl: string,
): PhotoPathResult {
  let parsed: URL
  let expected: URL

  try {
    parsed = new URL(url)
    expected = new URL(supabaseUrl)
  } catch {
    return { ok: false, reason: "invalid-url" }
  }

  if (parsed.origin !== expected.origin) {
    return { ok: false, reason: "external-url" }
  }

  if (parsed.username || parsed.password) {
    return { ok: false, reason: "invalid-url" }
  }

  const segments = parsed.pathname.split("/").filter(Boolean)

  // /storage/v1/object/{public|sign|authenticated}/<bucket>/<path>
  // /storage/v1/render/image/{public|authenticated}/<bucket>/<path>
  let bucket: string | undefined
  let pathSegments: string[]

  if (
    segments[0] === "storage" &&
    segments[1] === "v1" &&
    segments[2] === "object" &&
    (segments[3] === "public" ||
      segments[3] === "sign" ||
      segments[3] === "authenticated")
  ) {
    bucket = segments[4]
    pathSegments = segments.slice(5)
  } else if (
    segments[0] === "storage" &&
    segments[1] === "v1" &&
    segments[2] === "render" &&
    segments[3] === "image" &&
    (segments[4] === "public" || segments[4] === "authenticated")
  ) {
    bucket = segments[5]
    pathSegments = segments.slice(6)
  } else {
    return { ok: false, reason: "invalid-path" }
  }

  if (bucket !== ANIMAL_PHOTO_BUCKET) {
    return { ok: false, reason: "wrong-bucket" }
  }

  let path: string

  try {
    path = pathSegments.map((segment) => decodeURIComponent(segment)).join("/")
  } catch {
    return { ok: false, reason: "invalid-path" }
  }

  if (!isValidAnimalPhotoPath(path)) {
    return { ok: false, reason: "invalid-path" }
  }

  return { ok: true, bucket, path }
}

/**
 * Indexa a propriedade das fotos a partir das referências atuais.
 * Um caminho citado por mais de um animal é ambíguo e nunca deve ser apagado
 * automaticamente. A tabela `animal_photos`, quando usada, é combinada ao
 * mesmo índice.
 */
export function buildAnimalPhotoOwnership(
  animals: readonly CleanupAnimal[],
  extraPhotos: readonly AnimalPhotoReference[] = [],
  supabaseUrl = "",
): AnimalPhotoOwnership {
  const animalsByPath = new Map<string, Set<string>>()
  const referencesByAnimal = new Map<string, string[]>()

  const register = (animalId: string, path: string) => {
    const owners = animalsByPath.get(path) ?? new Set<string>()

    owners.add(animalId)

    animalsByPath.set(path, owners)

    const references = referencesByAnimal.get(animalId) ?? []

    if (!references.includes(path)) references.push(path)

    referencesByAnimal.set(animalId, references)
  }

  for (const animal of animals) {
    for (const url of animal.images ?? []) {
      if (!supabaseUrl) continue

      const parsed = parseAnimalPhotoUrl(url, supabaseUrl)

      if (parsed.ok) register(animal.id, parsed.path)
    }
  }

  for (const photo of extraPhotos) {
    if (isValidAnimalPhotoPath(photo.storagePath)) {
      register(photo.animalId, photo.storagePath)
    }
  }

  return { animalsByPath, referencesByAnimal }
}

/** Planeja a limpeza de um registro de adoção sem executar exclusões. */
export function planAdoptionPhotoCleanup(
  candidate: AdoptionCleanupCandidate,
  animals: readonly CleanupAnimal[],
  ownership: AnimalPhotoOwnership,
  supabaseUrl: string,
  now: Date,
): AdoptionPhotoCleanupPlan {
  const animal = candidate.animalId
    ? animals.find((entry) => entry.id === candidate.animalId)
    : undefined

  const adoptedAt = toCleanupTimestamp(candidate.adoptedAt)
  const deadline =
    adoptedAt === null
      ? null
      : new Date(adoptedAt + ADOPTION_PHOTO_RETENTION_MS)

  const removable: CleanupPhotoReference[] = []
  const shared: CleanupPhotoReference[] = []
  const invalid: InvalidCleanupPhoto[] = []
  const seenPaths = new Set<string>()

  for (const url of animal?.images ?? []) {
    const parsed = parseAnimalPhotoUrl(url, supabaseUrl)

    if (!parsed.ok) {
      invalid.push({ url, reason: parsed.reason })
      continue
    }

    if (seenPaths.has(parsed.path)) continue

    seenPaths.add(parsed.path)

    const owners = ownership.animalsByPath.get(parsed.path)

    if (!owners || owners.size !== 1 || !owners.has(animal!.id)) {
      shared.push({ url, path: parsed.path })
      continue
    }

    removable.push({ url, path: parsed.path })
  }

  return {
    adoptionId: candidate.adoptionId,
    animalId: candidate.animalId,
    animalName: candidate.animalName,
    adoptedAt: candidate.adoptedAt,
    deadline,
    expired: isCleanupWindowExpired(candidate.adoptedAt, now),
    removable,
    shared,
    invalid,
  }
}

export function sanitizeCleanupError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim().slice(0, 500)
  }

  return "Falha não identificada durante a limpeza das fotos."
}

/**
 * Compara o segredo apresentado ao segredo do servidor em tempo constante.
 * Sem segredo configurado, a resposta é sempre `false` (fail closed).
 */
export function isCleanupSecretValid(
  expected: string | null | undefined,
  received: string | null | undefined,
): boolean {
  if (!expected || !received) return false

  if (expected.length !== received.length) return false

  let mismatch = 0

  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ received.charCodeAt(index)
  }

  return mismatch === 0
}

function invalidPlanReason(plan: AdoptionPhotoCleanupPlan): string | null {
  if (plan.shared.length > 0) {
    return "Fotos compartilhadas ou de propriedade ambígua; revisão manual necessária."
  }

  if (plan.invalid.length > 0) {
    return "Há fotos com endereço inválido ou externo; revisão manual necessária."
  }

  return null
}

/**
 * Executa a limpeza de todas as adoções elegíveis. Nunca lança por falha de
 * um item: registra o resultado e segue para os próximos. Como só remove
 * arquivos de candidatos com janela vencida, é seguro repetir a execução.
 */
export async function runAdoptionPhotoCleanup(
  options: AdoptionPhotoCleanupOptions,
  dependencies: AdoptionPhotoCleanupDependencies,
): Promise<AdoptionPhotoCleanupReport> {
  const now = options.now ?? new Date()
  const report: AdoptionPhotoCleanupReport = {
    checked: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    items: [],
  }

  const candidates = await dependencies.listCandidates(now)

  if (candidates.length === 0) return report

  const animals = await dependencies.listAnimals()
  const photoReferences = await dependencies.listPhotoReferences()
  const ownership = buildAnimalPhotoOwnership(
    animals,
    photoReferences,
    options.supabaseUrl,
  )

  for (const candidate of candidates) {
    report.checked += 1

    const baseItem: AdoptionCleanupItemResult = {
      adoptionId: candidate.adoptionId,
      animalId: candidate.animalId,
      animalName: candidate.animalName,
      status: "skipped",
      removedPaths: [],
      reason: null,
    }

    if (
      candidate.cleanupStatus === "completed" ||
      candidate.cleanupStatus === "cancelled"
    ) {
      baseItem.reason = "Limpeza já concluída ou cancelada."
      report.skipped += 1
      report.items.push(baseItem)
      continue
    }

    if (!isCleanupWindowExpired(candidate.adoptedAt, now)) {
      baseItem.reason = "Janela de 30 dias ainda não vencida."
      report.skipped += 1
      report.items.push(baseItem)
      continue
    }

    const animal = candidate.animalId
      ? animals.find((entry) => entry.id === candidate.animalId)
      : undefined

    if (!animal || animal.status !== "adopted") {
      baseItem.reason = "Animal não está mais adotado."
      report.skipped += 1
      report.items.push(baseItem)
      continue
    }

    const plan = planAdoptionPhotoCleanup(
      candidate,
      animals,
      ownership,
      options.supabaseUrl,
      now,
    )

    const reviewReason = invalidPlanReason(plan)

    if (reviewReason) {
      baseItem.status = "failed"
      baseItem.reason = reviewReason

      try {
        await dependencies.recordCleanup(
          plan.adoptionId,
          "failed",
          [],
          reviewReason,
        )
      } catch (error) {
        baseItem.reason = `${reviewReason} ${sanitizeCleanupError(error)}`
      }

      report.failed += 1
      report.items.push(baseItem)
      continue
    }

    if (plan.removable.length === 0) {
      try {
        await dependencies.recordCleanup(plan.adoptionId, "completed", [], null)
        baseItem.status = "completed"
        report.completed += 1
      } catch (error) {
        baseItem.status = "failed"
        baseItem.reason = sanitizeCleanupError(error)
        report.failed += 1
      }

      report.items.push(baseItem)
      continue
    }

    const removal = await dependencies.removePaths(
      plan.removable.map((photo) => photo.path),
    )

    const removedSet = new Set(removal.removed)
    const removedUrls = plan.removable
      .filter((photo) => removedSet.has(photo.path))
      .map((photo) => photo.url)

    baseItem.removedPaths = [...removal.removed]

    const failureMessage =
      removal.errors.length > 0 ? removal.errors.join(" ").slice(0, 500) : null

    try {
      await dependencies.recordCleanup(
        plan.adoptionId,
        failureMessage ? "failed" : "completed",
        removedUrls,
        failureMessage,
      )

      if (failureMessage) {
        baseItem.status = "failed"
        baseItem.reason = failureMessage
        report.failed += 1
      } else {
        baseItem.status = "completed"
        report.completed += 1
      }
    } catch (error) {
      baseItem.status = "failed"
      baseItem.reason = sanitizeCleanupError(error)
      report.failed += 1
    }

    report.items.push(baseItem)
  }

  return report
}
