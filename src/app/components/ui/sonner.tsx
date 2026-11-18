"use client"

/**
 * Toaster global do SAAL (sonner, já presente nas dependências).
 *
 * Notificações discretas de sucesso/erro/informação, estilizadas com a
 * paleta do sistema (verde #2E7D6B, creme #F5EFE6, âmbar #E4B04A). O
 * componente é montado uma única vez em `main.tsx`; as chamadas usam
 * `toast.success` / `toast.error` / `toast.info` do próprio sonner.
 */

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      duration={5000}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border !border-[#2E7D6B]/15 !bg-white !text-[#333333] !shadow-lg",
          title: "!text-sm !font-semibold !text-[#333333]",
          description: "!text-xs !text-[#527f74]",
          success: "!border-l-4 !border-l-[#2E7D6B]",
          error: "!border-l-4 !border-l-red-600",
          warning: "!border-l-4 !border-l-[#E4B04A]",
          info: "!border-l-4 !border-l-[#E4B04A]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
