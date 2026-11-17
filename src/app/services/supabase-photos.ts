import { PhotoUploadError } from "./photo-storage"
import { MAX_ANIMAL_PHOTOS, MAX_PHOTO_BYTES } from "../utils/photo-selection"
import { supabase } from "../lib/supabase"

const storageBucket = "animal-photos"
const maxPhotosPerUpload = MAX_ANIMAL_PHOTOS
const maxPhotoBytes = MAX_PHOTO_BYTES

/** O armazenamento do Supabase Storage está configurado quando o bucket existe. */

export function isPhotoStorageConfigured(): boolean {
  return true
}

export interface PhotoUploadOptions {
  signal?: AbortSignal
  onProgress?: (percent: number) => void
}

/** Envia fotos para o Supabase Storage e devolve as URLs públicas. */

export async function uploadAnimalPhotos(
  files: readonly File[],
  options: PhotoUploadOptions = {},
): Promise<string[]> {
  if (files.length === 0) return []

  if (files.length > maxPhotosPerUpload) {
    throw new PhotoUploadError("rejected")
  }

  const urls: string[] = []

  for (let index = 0; index < files.length; index++) {
    if (options.signal?.aborted) {
      throw new PhotoUploadError("aborted")
    }

    const file = files[index] as File

    if (file.size > maxPhotoBytes) {
      throw new PhotoUploadError("too-large")
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const storagePath = `animals/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      throw new PhotoUploadError("network", 0)
    }

    const { data: urlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(storagePath)

    urls.push(urlData.publicUrl)

    options.onProgress?.(
      Math.min(100, Math.round(((index + 1) / files.length) * 100)),
    )
  }

  options.onProgress?.(100)

  return urls
}

export function getPhotoUploadErrorMessage(error: unknown): string {
  if (!(error instanceof PhotoUploadError)) {
    return "Não foi possível enviar as fotos. Tente novamente."
  }

  switch (error.failure) {
    case "network":
      return "Não foi possível enviar as fotos por falha de conexão. Verifique sua conexão e tente novamente."

    case "csrf":
      return "A verificação de segurança expirou antes do envio. Recarregue a página, entre novamente e tente de novo."

    case "unauthorized":
      return "Sua sessão não autoriza o envio de fotos. Entre novamente com uma conta autorizada."

    case "too-large":
      return "O servidor recusou uma das fotos por tamanho. Escolha arquivos menores e tente novamente."

    case "unsupported":
      return "Não foi possível processar uma das fotos. Use uma imagem JPG, PNG ou WebP válida."

    case "rate-limited":
      return "Muitos envios em pouco tempo. Aguarde alguns minutos e tente novamente."

    case "server":
      return "O serviço de fotos está temporariamente indisponível. Tente novamente em instantes."

    case "invalid-response":
      return "O serviço de fotos respondeu em um formato inesperado e nada foi confirmado como salvo. Tente novamente."

    case "aborted":
      return "O envio das fotos foi cancelado. Tente novamente."

    case "rejected":
      return `É permitido enviar no máximo ${maxPhotosPerUpload} fotos por animal.`

    default:
      return "Não foi possível enviar as fotos. Tente novamente."
  }
}
