/**
 * Sistema global de modais de confirmação do SAAL.
 *
 * Substitui as janelas nativas do navegador (`window.confirm` / `window.alert`)
 * por um diálogo acessível na identidade visual do sistema:
 *
 * - `ConfirmDialog`: componente visual (Radix AlertDialog — foco contido,
 *   Esc, Portal, bloqueio de scroll e retorno de foco ao acionador).
 * - `ConfirmProvider` + `useConfirm`: API imperativa `await confirm(...)`
 *   que resolve `true`/`false`, com estado de carregamento e feedback de
 *   falha dentro do próprio modal.
 *
 * Não introduz dependências novas: usa `@radix-ui/react-alert-dialog`,
 * `lucide-react` e as classes de animação já presentes no projeto.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import {
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import { cn } from "./utils"

export type ConfirmVariant = "default" | "warning" | "destructive"

export interface ConfirmOptions {
  /** Título curto do modal. */
  title: string

  /** Mensagem objetiva; frases curtas e quebras mantidas pelo CSS. */
  description: string

  /** Ícone contextual (Lucide). Padrão: por variante. */
  icon?: LucideIcon

  /** Rótulo do botão de confirmação. Padrão: "Confirmar". */
  confirmLabel?: string

  /** Rótulo do botão de cancelamento. Padrão: "Cancelar". */
  cancelLabel?: string

  /** Variante visual: normal, aviso ou destrutiva. Padrão: "default". */
  variant?: ConfirmVariant

  /**
   * Ação executada após a confirmação. Enquanto roda, o modal permanece
   * aberto com carregamento e impede fechamento acidental. Em falha, o erro
   * é exibido dentro do próprio modal e a promessa não resolve como
   * confirmada (a operação deve ser retomada pelo usuário).
   */
  onConfirm?: () => Promise<void>

  /** Mensagem exibida quando `onConfirm` falha. */
  failureMessage?: string
}

export type ConfirmRequest = ConfirmOptions & {
  resolve: (confirmed: boolean) => void
}

/** Estilo do selo do ícone e do botão de confirmação por variante. */
const variantStyles: Record<ConfirmVariant, {
  icon: LucideIcon
  badge: string
  confirmButton: string
}> = {
  default: {
    icon: HelpCircle,
    badge: "bg-[#2E7D6B]/10 text-[#2E7D6B]",
    confirmButton:
      "bg-[#2E7D6B] text-white hover:bg-[#256657] focus-visible:bg-[#256657]",
  },
  warning: {
    icon: AlertTriangle,
    badge: "bg-[#E4B04A]/20 text-[#8a6414]",
    confirmButton:
      "bg-[#E4B04A] text-[#3d2c07] hover:bg-[#c9963c] focus-visible:bg-[#c9963c]",
  },
  destructive: {
    icon: Trash2,
    badge: "bg-red-100 text-red-600",
    confirmButton:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:bg-red-700",
  },
}

export function ConfirmDialog({ request }: { request: ConfirmRequest }) {
  const {
    title,
    description,
    icon,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "default",
    onConfirm,
    failureMessage,
  } = request

  const styles = variantStyles[variant]

  const Icon = icon ?? styles.icon

  const [busy, setBusy] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleConfirm = useCallback(async () => {
    if (busy) return

    if (!onConfirm) {
      request.resolve(true)

      return
    }

    setBusy(true)

    setError(null)

    try {
      await onConfirm()

      request.resolve(true)
    } catch (cause) {
      // A operação falhou: o modal permanece aberto para nova tentativa e a
      // promessa fica pendente (o usuário decide entre tentar de novo ou
      // cancelar). Mensagens amigáveis podem vir do próprio handler; quando
      // não há mensagem segura, usa o texto genérico.
      setError(
        failureMessage ??
          (cause instanceof Error && cause.message
            ? cause.message
            : "A operação falhou. Tente novamente."),
      )
    } finally {
      setBusy(false)
    }
  }, [busy, failureMessage, onConfirm, request])

  const handleCancel = useCallback(() => {
    if (busy) return

    request.resolve(false)
  }, [busy, request])

  // Durante a operação, impedir fechamento acidental (Esc, overlay, botão
  // voltar do diálogo).
  const preventCloseWhileBusy = useCallback(
    (event: Event) => {
      if (busy) event.preventDefault()
    },
    [busy],
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !busy) handleCancel()
    },
    [busy, handleCancel],
  )

  return (
    <AlertDialogPrimitive.Root open onOpenChange={handleOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-[#1a2e28]/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <AlertDialogPrimitive.Content
          aria-modal="true"
          className={cn(
            "fixed top-1/2 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl bg-white p-6 shadow-xl outline-none sm:p-7",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onEscapeKeyDown={preventCloseWhileBusy}
        >
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                styles.badge,
              )}
            >
              <Icon size={20} />
            </span>

            <div className="min-w-0 flex-1">
              <AlertDialogPrimitive.Title className="text-lg leading-snug font-bold text-[#2E7D6B]">
                {title}
              </AlertDialogPrimitive.Title>

              <AlertDialogPrimitive.Description className="mt-1.5 text-sm leading-relaxed break-words text-[#527f74]">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          {error && (
            <p
              aria-live="assertive"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={16}
              />

              <span className="min-w-0 break-words">{error}</span>
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {/* AlertDialogPrimitive.Cancel: necessário para o Radix focar o
                botão de cancelar ao abrir (onOpenAutoFocus do alert dialog)
                e ativar a contenção de foco. */}
            <AlertDialogPrimitive.Cancel asChild>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2E7D6B]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#2E7D6B] transition-colors hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4B04A] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                type="button"
              >
                {cancelLabel}
              </button>
            </AlertDialogPrimitive.Cancel>

            <button
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4B04A] disabled:cursor-not-allowed disabled:opacity-70",
                styles.confirmButton,
              )}
              disabled={busy}
              onClick={() => {
                void handleConfirm()
              }}
              type="button"
            >
              {busy && (
                <Loader2
                  aria-hidden="true"
                  className="animate-spin"
                  size={16}
                />
              )}

              {confirmLabel}
            </button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)

  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    // Uma confirmação por vez: nova chamada enquanto outra está pendente
    // resolve a anterior como cancelada para não perder o resolver.
    resolverRef.current?.(false)

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve

      setRequest({ ...options, resolve })
    })
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  const close = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed)

    resolverRef.current = null

    setRequest(null)
  }, [])

  const handledRequest = useMemo(
    () => (request ? { ...request, resolve: close } : null),
    [request, close],
  )

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {handledRequest && <ConfirmDialog request={handledRequest} />}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const confirm = useContext(ConfirmContext)?.confirm

  if (!confirm) {
    throw new Error(
      "useConfirm deve ser usado dentro de ConfirmProvider (main.tsx).",
    )
  }

  return confirm
}
