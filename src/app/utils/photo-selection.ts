/** Limites técnicos provisórios. A política definitiva de upload da ONG
 * (ONG-06) continua pendente; estes valores apenas evitam arquivos inválidos
 * no navegador e são aplicados de novo pelo endpoint de upload. */

export const MIN_ANIMAL_PHOTOS = 1

export const MAX_ANIMAL_PHOTOS = 3

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024

export interface PhotoSelectionResult {
  accepted: File[]

  errors: string[]
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isSupportedPhotoType(file: File): boolean {
  return file.type.startsWith("image/")
}

function fileSignature(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

/**
 * Valida os arquivos escolhidos antes de qualquer envio. Nunca descarta um
 * arquivo silenciosamente: cada recusa vira uma mensagem compreensível.
 */

export function selectPhotoFiles(
  files: Iterable<File>,

  currentCount: number,

  existing: readonly File[] = [],
): PhotoSelectionResult {
  const accepted: File[] = []

  const errors: string[] = []

  const known = new Set(existing.map(fileSignature))

  const available = Math.max(0, MAX_ANIMAL_PHOTOS - currentCount)

  if (available === 0) {
    return {
      accepted,

      errors: [`O limite é de ${MAX_ANIMAL_PHOTOS} fotos por animal.`],
    }
  }

  for (const file of files) {
    if (!isSupportedPhotoType(file)) {
      errors.push(
        `"${file.name}" não é uma imagem aceita. Escolha um arquivo de imagem.`,
      )

      continue
    }

    if (file.size > MAX_PHOTO_BYTES) {
      errors.push(
        `"${file.name}" tem ${formatFileSize(file.size)}. O limite por foto é ${formatFileSize(
          MAX_PHOTO_BYTES,
        )}.`,
      )

      continue
    }

    if (known.has(fileSignature(file))) {
      errors.push(`"${file.name}" já foi adicionada.`)

      continue
    }

    if (accepted.length >= available) {
      errors.push(
        `Foram selecionadas mais fotos que o limite. Mantenha no máximo ${MAX_ANIMAL_PHOTOS}.`,
      )

      break
    }

    known.add(fileSignature(file))

    accepted.push(file)
  }

  return { accepted, errors }
}

/** Move um item preservando a ordem dos demais; usado na reordenação acessível. */

export function moveListItem<T>(
  items: readonly T[],

  from: number,

  to: number,
): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return [...items]
  }

  const next = [...items]

  const [moved] = next.splice(from, 1)

  next.splice(to, 0, moved as T)

  return next
}
