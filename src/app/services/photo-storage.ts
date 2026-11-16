import { AdminAuthError, csrfHeaderName, requestCsrfToken } from "./admin-auth"

/**
 * Integração de upload preparada para um endpoint multipart same-origin.
 *
 * Contrato esperado:
 * - `POST ${VITE_PHOTO_UPLOAD_URL}` com `multipart/form-data`;
 * - um campo `photos` por arquivo, na ordem da galeria;
 * - cabeçalho CSRF da sessão administrativa;
 * - resposta `{ "urls": ["https://...", "/..."] }` com uma URL persistente
 *   por arquivo enviado.
 *
 * Sem `VITE_PHOTO_UPLOAD_URL`, nenhum binário é enviado e a interface bloqueia
 * o salvamento de fotos locais em vez de gravá-las como se fossem persistentes.
 */
const uploadFieldName = "photos"

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

export function getPhotoUploadUrl(): string | null {
  const configured = import.meta.env.VITE_PHOTO_UPLOAD_URL

  if (typeof configured !== "string") return null

  const trimmed = configured.trim()

  return trimmed.length > 0 ? trimmed : null
}

export function isPhotoStorageConfigured(): boolean {
  return getPhotoUploadUrl() !== null
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

export async function uploadAnimalPhotos(
  files: readonly File[],

  options: PhotoUploadOptions = {},
): Promise<string[]> {
  const endpoint = getPhotoUploadUrl()

  if (!endpoint) {
    throw new PhotoUploadError("not-configured")
  }

  if (files.length === 0) return []

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

  if (options.signal?.aborted) {
    throw new PhotoUploadError("aborted")
  }

  return new Promise<string[]>((resolve, reject) => {
    const request = new XMLHttpRequest()

    const settle = (action: () => void) => {
      options.signal?.removeEventListener("abort", abort)

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
        options.onProgress?.(0)

        return
      }

      options.onProgress?.(
        Math.min(100, Math.round((event.loaded / event.total) * 100)),
      )
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

      if (!urls || urls.length !== files.length) {
        settle(() =>
          reject(new PhotoUploadError("invalid-response", request.status)),
        )

        return
      }

      options.onProgress?.(100)

      settle(() => resolve(urls))
    }

    options.signal?.addEventListener("abort", abort)

    const body = new FormData()

    files.forEach((file) => body.append(uploadFieldName, file, file.name))

    request.send(body)
  })
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
      return "O servidor recusou o formato de uma das fotos. Use JPG, PNG ou WebP."

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
