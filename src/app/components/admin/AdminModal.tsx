import type { ReactNode } from "react"

import { X } from "lucide-react"

interface AdminModalProps {
  title: string
  titleId: string
  onClose: () => void
  children: ReactNode
  maxWidthClassName?: string
}

/** Moldura acessível dos modais administrativos, na identidade visual do SAAL. */
export function AdminModal({
  title,
  titleId,
  onClose,
  children,
  maxWidthClassName = "max-w-lg",
}: AdminModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`my-auto flex max-h-[calc(100dvh-1.5rem)] w-full ${maxWidthClassName} flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#F5EFE6] p-4 sm:p-6">
          <h2
            id={titleId}
            className="text-xl font-bold text-[#2E7D6B] sm:text-2xl"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
          >
            <X className="text-[#6FAE9C]" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
