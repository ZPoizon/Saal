import { AdminAuthError, csrfHeaderName, requestCsrfToken } from "./admin-auth"

/**
 * Upload de fotografias para a API SAAL.
 *
 * Contrato:
 * - `POST /api/v1/admin/photos` com `multipart/form-data`;
 * - um campo `photos` por arquivo;
 * - cabeçalho CSRF da sessão administrativa;
 * - resposta `{ "urls": ["/api/v1/photos/123"] }` com uma URL persistente por arquivo.
 *
 * Antes do envio, cada imagem é redesenhada em canvas: a orientação EXIF é
 * aplicada, o maior lado é limitado a 1600 px e os metadados são removidos. O
 * envio é sequencial (uma foto por requisição) para reduzir o tamanho do corpo
 * e evitar limites de proxy.
 */

const defaultUploadUrl = "/api/v1/admin/photos"

const uploadFieldName = "photos"

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

export function getPhotoUploadUrl(): string {
  const configured = import.meta.env.VITE_PHOTO_UPLOAD_URL

  if (typeof configured !== "string") return defaultUploadUrl

  const trimmed = configured.trim()

  return trimmed.length > 0 ? trimmed : defaultUploadUrl
}

export function isPhotoStorageConfigured(): boolean {
  return true
}

function failureFromStatus(status: number): PhotoUploadFailure {
  if (status === 401 || status === 403) return "unauthorized"

  if (status === 413) return "too-large"

  if (status === 415) return "unsupported"

  if (status === 429) return "rate-limited"

  if (status >= 500) return "server"

  return "rejected"
}

function isPersistentPhotoUrl(value: string): boolean {
  return value.startsWith("/") || /^https?:\/\//i.test(value)
}

function readUploadedUrls(payload: unknown): string[] | null {
  if (typeof payload !== "object" || payload === null || !("urls" in payload)) {
    return null
  }

  const urls = payload.urls

  if (!Array.isArray(urls)) return null

  if (
    urls.length === 0 ||
    !urls.every(
      (url): url is string =>
        typeof url === "string" && isPersistentPhotoUrl(url.trim()),
    )
  ) {
    return null
  }

  return urls.map((url) => url.trim())
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

function uploadSingle(
  endpoint: string,

  csrfToken: string,

  file: File,

  signal: AbortSignal | undefined,

  onProgress: (fraction: number) => void,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest()

    const settle = (action: () => void) => {
      signal?.removeEventListener("abort", abort)

      action()
    }

    const abort = () => {
      request.abort()
    }

    request.open("POST", endpoint, true)

    request.withCredentials = true

    request.setRequestHeader("Accept", "application/json")

    request.setRequestHeader(csrfHeaderName, csrfToken)

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) {
        onProgress(0)

        return
      }

      onProgress(Math.min(1, event.loaded / event.total))
    }

    request.onerror = () =>
      settle(() => reject(new PhotoUploadError("network")))

    request.ontimeout = () =>
      settle(() => reject(new PhotoUploadError("network")))

    request.onabort = () =>
      settle(() => reject(new PhotoUploadError("aborted")))

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        settle(() =>
          reject(
            new PhotoUploadError(
              failureFromStatus(request.status),

              request.status,
            ),
          ),
        )

        return
      }

      let payload: unknown

      try {
        payload = (JSON.parse(request.responseText) as unknown)
      } catch {
        settle(() =>
          reject(new PhotoUploadError("invalid-response", request.status)),
        )

        return
      }

      const urls = readUploadedUrls(payload)

      if (!urls || urls.length !== 1) {
        settle(() =>
          reject(new PhotoUploadError("invalid-response", request.status)),
        )

        return
      }

      onProgress(1)

      settle(() => resolve(urls[0] as string))
    }

    signal?.addEventListener("abort", abort)

    const body = new FormData()

    body.append(uploadFieldName, file, file.name)

    request.send(body)
  })
}

export async function uploadAnimalPhotos(
  files: readonly File[],

  options: PhotoUploadOptions = {},
): Promise<string[]> {
  if (files.length === 0) return []

  if (files.length > maxPhotosPerUpload) {
    throw new PhotoUploadError("rejected")
  }

  let csrfToken: string

  try {
    csrfToken = await requestCsrfToken()
  } catch (error) {
    if (error instanceof AdminAuthError && error.failure === "network") {
      throw new PhotoUploadError("network")
    }

    throw new PhotoUploadError(
      "csrf",

      error instanceof AdminAuthError ? error.status : 0,
    )
  }

  const normalized: File[] = []

  for (const file of files) {
    if (options.signal?.aborted) {
      throw new PhotoUploadError("aborted")
    }

    try {
      normalized.push(await normalizePhotoFile(file))
    } catch {
      throw new PhotoUploadError("unsupported")
    }
  }

  const endpoint = getPhotoUploadUrl()

  const urls: string[] = []

  for (let index = 0; index < normalized.length; index++) {
    if (options.signal?.aborted) {
      throw new PhotoUploadError("aborted")
    }

    const url = await uploadSingle(
      endpoint,

      csrfToken,

      normalized[index] as File,

      options.signal,

      (fraction) => {
        const percent = ((index + fraction) / normalized.length) * 100

        options.onProgress?.(Math.min(100, Math.round(percent)))
      },
    )

    urls.push(url)
  }

  options.onProgress?.(100)

  return urls
}

export function getPhotoUploadErrorMessage(error: unknown): string {
  if (!(error instanceof PhotoUploadError)) {
    return "Não foi possível enviar as fotos. Tente novamente."
  }

  switch (error.failure) {
    case "not-configured":
      return "O armazenamento de fotos não está configurado neste ambiente. As fotos escolhidas ficaram apenas como prévia local e não foram salvas."

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

    default:
      return "O servidor recusou as fotos. Revise os arquivos e tente novamente."
  }
}
