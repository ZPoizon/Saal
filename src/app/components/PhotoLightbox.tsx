import { useEffect, useRef, useState } from "react"

import { X, ChevronLeft, ChevronRight } from "lucide-react"

import { createPortal } from "react-dom"

import { SafeImage } from "./SafeImage"

interface PhotoLightboxProps {
  images: string[]
  currentIndex: number
  open: boolean
  onClose: () => void
  onNavigate: (index: number) => void
  altBase: string
}

export function PhotoLightbox({
  images,
  currentIndex,
  open,
  onClose,
  onNavigate,
  altBase,
}: PhotoLightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [focusReturn, setFocusReturn] = useState<HTMLElement | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const active = document.activeElement as HTMLElement
    if (active && active instanceof HTMLElement) {
      setFocusReturn(active)
    }

    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      } else if (event.key === "ArrowRight") {
        onNavigate(Math.min(currentIndex + 1, images.length - 1))
      } else if (event.key === "ArrowLeft") {
        onNavigate(Math.max(currentIndex - 1, 0))
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
      focusReturn?.focus()
    }
  }, [open, currentIndex, images.length, onClose, focusReturn])

  useEffect(() => {
    if (!open) return

    const handleResize = () => {
      // Força reavaliação do tamanho da imagem
      window.dispatchEvent(new Event("resize"))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [open])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return

    const diff = touchStart - e.changedTouches[0].clientX

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNavigate(Math.min(currentIndex + 1, images.length - 1))
      } else {
        onNavigate(Math.max(currentIndex - 1, 0))
      }
    }

    setTouchStart(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onClose()
    }
  }

  if (!open || !mounted) return null

  const hasMultiple = images.length > 1

  const lightboxContent = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative max-h-[90dvh] max-w-[90vw]">
        <SafeImage
          src={images[currentIndex]}
          alt={`${altBase} - foto ${currentIndex + 1} de ${images.length}`}
          className="max-h-[90dvh] max-w-[90vw] object-contain"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar galeria"
          className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <X size={24} />
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => onNavigate(Math.max(currentIndex - 1, 0))}
              disabled={currentIndex === 0}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={() =>
                onNavigate(Math.min(currentIndex + 1, images.length - 1))
              }
              disabled={currentIndex === images.length - 1}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
              {currentIndex + 1} de {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(lightboxContent, document.body)
}
