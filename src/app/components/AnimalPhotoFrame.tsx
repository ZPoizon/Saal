import { useState } from "react"

import { PawPrint } from "lucide-react"

import { SafeImage } from "./SafeImage"

interface AnimalPhotoFrameProps {
  src?: string | null
  alt: string
  className?: string
  ratio?: string
  fallbackLabel?: string
}

export function AnimalPhotoFrame({
  src,
  alt,
  className,
  ratio = "aspect-[4/3]",
  fallbackLabel = "Foto indisponível",
}: AnimalPhotoFrameProps) {
  const [hasError, setHasError] = useState(false)

  const showFallback = !src || hasError

  return (
    <div
      className={`relative overflow-hidden rounded-b-2xl bg-[#F5EFE6] ${ratio} ${className}`}
    >
      {src && !hasError && (
        <>
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover blur-[18px] scale-110 opacity-70"
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
          />
          <div
            className="absolute inset-0 bg-[#F5EFE6]/40"
            aria-hidden="true"
          />
        </>
      )}
      <div className="relative h-full w-full">
        <SafeImage
          src={src}
          alt={alt}
          fallbackLabel={fallbackLabel}
          className="h-full w-full object-contain"
        />
      </div>
      {showFallback && (
        <div
          role="img"
          aria-label={fallbackLabel}
          className="absolute inset-0 flex items-center justify-center bg-[#F5EFE6] text-[#6FAE9C]"
        >
          <PawPrint aria-hidden="true" className="h-1/2 w-1/2" />
        </div>
      )}
    </div>
  )
}
