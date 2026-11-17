import { Heart, DollarSign, Share2, Clipboard, Check } from "lucide-react"

import { motion } from "motion/react"

import { useState } from "react"

import { useSiteSettings } from "../contexts/SiteSettingsContext"

export function HelpBanner() {
  const { settings } = useSiteSettings()

  const { donations } = settings

  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  )

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(donations.pixKey)

      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
  }

  return (
    <section
      id="doacoes"
      className="py-12 bg-gradient-to-r from-[#E4B04A] to-[#d4a03a] text-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Como Você Pode Ajudar
          </h2>
          <p className="text-sm md:text-base opacity-90">
            Além de adotar, existem outras formas de apoiar nosso trabalho
          </p>
        </div>

        <div
          className={`grid grid-cols-1 ${
            donations.enabled ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-6 max-w-4xl mx-auto`}
        >
          {donations.enabled && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="font-semibold mb-2">Faça uma Doação</h3>
              {donations.campaign && (
                <p className="mb-2 text-sm font-semibold">
                  {donations.campaign}
                </p>
              )}
              <p className="whitespace-pre-line text-sm opacity-90">
                {donations.instructions ||
                  "Ajude com ração, medicamentos e tratamentos veterinários."}
              </p>
              {donations.beneficiary && (
                <p className="mt-3 text-xs">
                  Beneficiário: {donations.beneficiary}
                </p>
              )}
              {donations.qrCodeUrl && (
                <img
                  src={donations.qrCodeUrl}
                  alt="QR Code PIX para doação"
                  className="mx-auto mt-4 h-32 w-32 rounded-lg bg-white object-contain p-2"
                />
              )}
              {donations.pixKey && (
                <div className="mt-4 rounded-lg bg-white/15 p-3">
                  <p className="break-all text-sm font-semibold">
                    {donations.pixKey}
                  </p>
                  <button
                    type="button"
                    onClick={copyPixKey}
                    className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6]"
                  >
                    {copyState === "copied" ? (
                      <Check size={16} />
                    ) : (
                      <Clipboard size={16} />
                    )}
                    {copyState === "copied"
                      ? "Chave copiada"
                      : "Copiar chave PIX"}
                  </button>
                  {copyState === "error" && (
                    <p role="alert" className="mt-2 text-xs">
                      Não foi possível copiar. Selecione e copie a chave
                      manualmente.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7" fill="white" />
            </div>
            <h3 className="font-semibold mb-2">Seja Voluntário</h3>
            <p className="text-sm opacity-90">
              Doe seu tempo e carinho cuidando dos animais
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-7 h-7" />
            </div>
            <h3 className="font-semibold mb-2">Divulgue</h3>
            <p className="text-sm opacity-90">
              Compartilhe nosso trabalho e ajude a encontrar lares
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
