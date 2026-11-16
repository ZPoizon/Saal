import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5515996927636?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20adoção."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-[#25D366] text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-6 h-6 md:w-7 md:h-7" fill="white" />
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Fale conosco!
      </span>
    </a>
  )
}
