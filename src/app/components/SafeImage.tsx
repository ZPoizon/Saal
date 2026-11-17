import { useState } from "react"

import { PawPrint } from "lucide-react"

import { withImageParams } from "../utils/images"

interface SafeImageProps {
  src?: string | null

  alt: string

  className?: string

  /** Parâmetros opcionais de redimensionamento para serviços que os suportam. */

  params?: Record<string, string | number>

  fallbackLabel?: string
}

function classes(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ")
}

/**
 * Renderiza uma imagem remota com fallback local quando a URL está vazia ou
 * quebrada. Evita depender de placeholders externos e nunca troca a imagem
 * oficial por outra quando ela carrega normalmente.
 */

export function SafeImage({
  src,

  alt,

  className,

  params,

  fallbackLabel = "Foto indisponível",
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const resolved = src ? (params ? withImageParams(src, params) : src) : ""

  if (!resolved || failedSrc === resolved) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel}
        className={classes(
          className,

          "flex items-center justify-center bg-[#F5EFE6] text-[#6FAE9C]",
        )}
      >
        <PawPrint aria-hidden="true" className="h-1/2 w-1/2" />
      </div>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(resolved)}
    />
  )
}
