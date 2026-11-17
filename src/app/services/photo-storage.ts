/**
 * Fotos em modo protótipo local (sem API).
 *
 * A normalização continua real: a orientação EXIF é aplicada, o maior lado é
 * limitado a 1600 px e os metadados são removidos. Em vez de enviar o arquivo
 * a um servidor, o resultado é convertido em `data:` URL e passa a compor o
 * cadastro do animal, que fica salvo apenas neste navegador (ADR-008). Quando
 * a API for religada, o envio volta a ser `POST /api/v1/admin/photos`.
 */

const maxPhotosPerUpload = 3

const maxNormalizedDimension = 1600

const normalizedJpegQuality = 0.82

export type PhotoUploadFailure = "not-configured" | "network" | "csrf" | "unauthorized" | "too-large" | "unsupported" | "rate-limited" | "rejected" | "server" | "invalid-response" | "aborted"

export class PhotoUploadError extends Error {
  readonly failure: PhotoUploadFailure

  readonly status: number

  constructor(failure: PhotoUploadFailure, status = 0) {
    super(
      status > 0
        ? `O upload de fotos respondeu com HTTP ${status}.`
        : "Não foi possível enviar as fotos.",
    )

    this.name = "PhotoUploadError"

    this.failure = failure

    this.status = status
  }
}

/** O armazenamento local sempre está disponível neste modo. */

export function isPhotoStorageConfigured(): boolean {
  return true
}

export interface PhotoUploadOptions {
  signal?: AbortSignal

  onProgress?: (percent: number) => void
}

type DecodedPhoto = ImageBitmap | HTMLImageElement

interface PhotoDimensions {
  width: number

  height: number
}

/** Ajusta as dimensões sem ampliar imagens pequenas. Exportada para teste. */

export function fitWithin(
  width: number,

  height: number,

  max: number,
): PhotoDimensions {
  const largest = Math.max(width, height)

  if (largest <= max) {
    return {
      width: Math.max(1, Math.round(width)),

      height: Math.max(1, Math.round(height)),
    }
  }

  const ratio = max / largest

  return {
    width: Math.max(1, Math.round(width * ratio)),

    height: Math.max(1, Math.round(height * ratio)),
  }
}

async function decodePhoto(file: File): Promise<DecodedPhoto> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" })
    } catch {
      // Navegadores sem suporte à opção caem no <img>, que aplica EXIF modernamente.
    }
  }

  return loadImageElement(file)
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)

    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)

      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)

      reject(new Error("Não foi possível ler a imagem."))
    }

    image.src = objectUrl
  })
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Não foi possível converter a imagem."))
        }
      },

      "image/jpeg",

      normalizedJpegQuality,
    )
  })
}

function normalizedFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim()

  return `${base.length > 0 ? base.slice(0, 80) : "foto"}.jpg`
}

/**
 * Normaliza uma foto escolhida no celular. A conversão para JPEG elimina
 * metadados (inclusive EXIF) e garante que a orientação exibida seja a
 * persistida. A prévia local continua sendo o arquivo original.
 */

export async function normalizePhotoFile(file: File): Promise<File> {
  const decoded = await decodePhoto(file)

  try {
    if (decoded.width <= 0 || decoded.height <= 0) {
      throw new Error("Imagem sem dimensões válidas.")
    }

    const target = fitWithin(
      decoded.width,

      decoded.height,

      maxNormalizedDimension,
    )

    const canvas = document.createElement("canvas")

    canvas.width = target.width

    canvas.height = target.height

    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("Canvas indisponível.")
    }

    // Fundo branco evita transparência virar preto ao converter PNG para JPEG.

    context.fillStyle = "#FFFFFF"

    context.fillRect(0, 0, target.width, target.height)

    context.drawImage(decoded, 0, 0, target.width, target.height)

    const blob = await canvasToJpeg(canvas)

    return new File([blob], normalizedFileName(file.name), {
      type: "image/jpeg",

      lastModified: Date.now(),
    })
  } finally {
    if (typeof ImageBitmap !== "undefined" && decoded instanceof ImageBitmap) {
      decoded.close()
    }
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new PhotoUploadError("unsupported"))
      }
    }

    reader.onerror = () => reject(new PhotoUploadError("unsupported"))

    reader.readAsDataURL(file)
  })
}

/**
 * Processa as fotos localmente e devolve `data:` URLs (sem servidor). O
 * consumo de espaço do navegador é limitado por `maxPhotosPerUpload`.
 */

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

    let normalized: File

    try {
      normalized = await normalizePhotoFile(files[index] as File)
    } catch {
      throw new PhotoUploadError("unsupported")
    }

    const url = await fileToDataUrl(normalized)

    urls.push(url)

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
