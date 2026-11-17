import { Link } from "react-router"

import { CalendarDays, Heart, Lock, MapPin, PawPrint } from "lucide-react"

import { motion } from "motion/react"

import { AnimalCard } from "../components/AnimalCard"

import { useAsync } from "../hooks/useAsync"

import { listPublicAnimals } from "../services/supabase-animals"

import { ScrollReveal } from "../components/ScrollReveal"

import { HelpBanner } from "../components/HelpBanner"

import { useSiteSettings } from "../contexts/SiteSettingsContext"

import { getActiveCampaigns } from "../data/siteSettings"

export function Home() {
  const { settings } = useSiteSettings()

  const { home, contact, statistics, about, adoption } = settings

  const { data, status, reload } = useAsync("home-animals", () =>
    listPublicAnimals(),
  )

  const availableAnimals = (data ?? []).slice(0, 3)

  const activeCampaigns = getActiveCampaigns(settings.campaigns)

  const publicStats = [
    statistics.showRescued && statistics.historicalRescues !== null
      ? {
          icon: Heart,

          label: "Resgates antes do sistema",

          value: statistics.historicalRescues,
        }
      : null,

    statistics.showAdoptions && statistics.historicalAdoptions !== null
      ? {
          icon: Heart,

          label: "Adoções antes do sistema",

          value: statistics.historicalAdoptions,
        }
      : null,

    statistics.showStartYear && statistics.startYear !== null
      ? {
          icon: CalendarDays,

          label: "Desde",

          value: statistics.startYear,
        }
      : null,

    statistics.showSystemCounts && status === "success"
      ? {
          icon: PawPrint,

          label: "Animais disponíveis",

          value: data?.length ?? 0,
        }
      : null,
  ].filter((stat): stat is NonNullable<typeof stat> => stat !== null)

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-[#2E7D6B] to-[#6FAE9C] py-16 text-white sm:py-20 md:py-32"
        style={
          home.heroImageUrl
            ? {
                backgroundImage: `linear-gradient(120deg, rgba(46,125,107,.9), rgba(111,174,156,.82)), url("${home.heroImageUrl}")`,

                backgroundPosition: "center",

                backgroundSize: "cover",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-20 right-20 h-40 w-40 rounded-full bg-[#E4B04A] blur-3xl"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-4"
            >
              <Heart
                className="h-5 w-5 shrink-0 text-[#E4B04A]"
                fill="#E4B04A"
              />
              <span className="text-xs sm:text-sm">
                Santuário de Animais Anjos da Luz
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 text-3xl font-bold leading-tight sm:text-4xl md:text-6xl"
            >
              {home.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-4 text-base text-[#F5EFE6] sm:text-lg md:text-xl"
            >
              {home.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center justify-center gap-2 text-sm text-[#F5EFE6] mb-8"
            >
              <MapPin size={16} />
              <span>
                {[contact.city, contact.state].filter(Boolean).join(" - ")}
              </span>
            </motion.div>
            {home.highlightMessage && (
              <p className="mb-6 rounded-xl bg-white/15 px-4 py-3 text-sm text-white">
                {home.highlightMessage}
              </p>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="relative z-10 pointer-events-auto flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
            >
              <Link
                to={home.primaryButtonDestination}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B04A] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#d4a03a] hover:shadow-xl sm:w-auto"
              >
                {home.primaryButtonText}
              </Link>
              <Link
                to="/admin"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto"
              >
                <Lock size={18} />
                Área Administrativa
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F5EFE6"
            />
          </svg>
        </div>
      </section>

      {activeCampaigns.length > 0 && (
        <section aria-label="Campanhas e avisos" className="bg-white py-8">
          <div className="container mx-auto grid gap-4 px-4 md:grid-cols-2">
            {activeCampaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="overflow-hidden rounded-2xl border border-[#2E7D6B]/10 bg-[#F5EFE6] shadow-sm"
              >
                {campaign.imageUrl && (
                  <img
                    src={campaign.imageUrl}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#E4B04A]">
                    {campaign.type === "feira"
                      ? "Feira de adoção"
                      : campaign.type}
                  </p>
                  <h2 className="text-xl font-bold text-[#2E7D6B]">
                    {campaign.title}
                  </h2>
                  {campaign.description && (
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                      {campaign.description}
                    </p>
                  )}
                  {campaign.endDate && (
                    <p className="mt-3 text-xs text-[#527f74]">
                      Até{" "}
                      {new Date(
                        `${campaign.endDate}T00:00:00`,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {publicStats.length > 0 && (
        <section className="bg-[#F5EFE6] py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {publicStats.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white p-4 text-center shadow-md transition-shadow hover:shadow-lg sm:p-6"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E4B04A]">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mb-1 text-3xl font-bold text-[#2E7D6B]">
                      {value.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-[#6FAE9C]">{label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#2E7D6B] sm:text-3xl md:text-4xl mb-4">
                  Sobre o SAAL
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {about.history}
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {about.institutionalText}
                </p>
                {about.additionalInfo && (
                  <p className="mb-6 whitespace-pre-line leading-relaxed text-gray-700">
                    {about.additionalInfo}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/animais"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E4B04A] px-6 py-3 text-center font-semibold text-white shadow-md transition-all hover:bg-[#d4a03a] hover:shadow-lg"
                  >
                    Adotar um Animal
                  </Link>
                  <Link
                    to="/contato"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2E7D6B] px-6 py-3 text-center font-semibold text-white shadow-md transition-all hover:bg-[#6FAE9C] hover:shadow-lg"
                  >
                    Fale Conosco
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#2E7D6B] to-[#6FAE9C] rounded-2xl p-8 text-white">
                  <Heart
                    className="w-12 h-12 text-[#E4B04A] mb-4"
                    fill="#E4B04A"
                  />
                  <h3 className="text-2xl font-bold mb-3">Nossa Missão</h3>
                  <p className="text-[#F5EFE6] leading-relaxed">
                    {about.mission}
                  </p>
                </div>
              </div>
              {about.photoUrls.some(Boolean) && (
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  {about.photoUrls
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((photoUrl) => (
                      <img
                        key={photoUrl}
                        src={photoUrl}
                        alt="Fotografia institucional da ONG"
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Available Animals Section */}
      <section className="bg-[#F5EFE6] py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-[#2E7D6B] sm:text-3xl md:text-4xl mb-4">
              Animais Disponíveis para Adoção
            </h2>
            <p className="text-[#6FAE9C] max-w-2xl mx-auto">
              {home.presentationText}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {availableAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>

          {status === "loading" && (
            <p role="status" className="text-center text-[#6FAE9C]">
              Carregando animais…
            </p>
          )}
          {status === "error" && (
            <div className="text-center">
              <p role="alert" className="text-[#6FAE9C]">
                Não foi possível carregar os animais agora.
              </p>
              <button
                type="button"
                onClick={reload}
                className="mt-3 text-sm font-semibold text-[#527f74] underline underline-offset-4 hover:text-[#E4B04A]"
              >
                Tentar novamente
              </button>
            </div>
          )}
          {status === "success" && availableAnimals.length === 0 && (
            <p className="text-center text-[#6FAE9C]">
              Nenhum animal disponível no momento.
            </p>
          )}

          <div className="text-center">
            <Link
              to="/animais"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2E7D6B] px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#6FAE9C] hover:shadow-lg"
            >
              Ver Todos os Animais
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-[#2E7D6B] sm:text-3xl md:text-4xl mb-4">
              Como Funciona a Adoção
            </h2>
            <p className="text-[#6FAE9C] max-w-2xl mx-auto">
              {adoption.explanation}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {adoption.steps.map((step, index) => (
              <div key={`${step.title}-${index}`} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E4B04A] shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-[#2E7D6B]">
                  {step.title}
                </h3>
                <p className="whitespace-pre-line text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          {adoption.requirements && (
            <p className="mx-auto mt-8 max-w-3xl whitespace-pre-line rounded-xl bg-[#F5EFE6] p-4 text-sm text-gray-700">
              {adoption.requirements}
            </p>
          )}
          {adoption.faqs.length > 0 && (
            <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
              {adoption.faqs.map((faq, index) => (
                <article
                  key={`${faq.question}-${index}`}
                  className="rounded-xl bg-[#F5EFE6] p-4"
                >
                  <h3 className="font-semibold text-[#2E7D6B]">
                    {faq.question}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          )}
          {!adoption.acceptingInterests && (
            <p className="mx-auto mt-6 max-w-3xl rounded-xl border border-[#E4B04A]/50 bg-[#E4B04A]/10 p-4 text-center text-sm text-[#6b5425]">
              No momento, não estamos recebendo novas manifestações de interesse.
            </p>
          )}
        </div>
      </section>

      {/* Help Banner */}
      <HelpBanner />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#2E7D6B] to-[#6FAE9C] py-12 text-white sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <Heart
              className="w-16 h-16 text-[#E4B04A] mx-auto mb-6"
              fill="#E4B04A"
            />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Faça a Diferença na Vida de um Animal
            </h2>
            <p className="text-lg mb-8 text-[#F5EFE6] max-w-2xl mx-auto">
              Adotar é um ato de amor. Você ganha um amigo fiel e salva uma
              vida.
            </p>
            <Link
              to="/animais"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E4B04A] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#d4a03a] hover:shadow-xl"
            >
              Encontre Seu Novo Amigo
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
