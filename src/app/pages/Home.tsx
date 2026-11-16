import { Link } from "react-router"

import {
  Heart,
  Home as HomeIcon,
  Stethoscope,
  MapPin,
  Lock,
  CalendarDays,
  PawPrint,
} from "lucide-react"

import { motion } from "motion/react"

import { AnimalCard } from "../components/AnimalCard"

import { ScrollReveal } from "../components/ScrollReveal"

import { HelpBanner } from "../components/HelpBanner"

import { useAnimals } from "../contexts/AnimalContext"
import { useSiteSettings } from "../contexts/SiteSettingsContext"
import {
  getActiveCampaigns,
  getCurrentAnimalCounts,
  getHistoricalImpactTotals,
} from "../data/siteSettings"

export function Home() {
  const { animals } = useAnimals()
  const { settings } = useSiteSettings()
  const { statistics, home, about, adoption } = settings
  const availableAnimals = animals
    .filter((animal) => animal.status === "available")
    .slice(0, 3)
  const counts = getCurrentAnimalCounts(animals)
  const impactTotals = getHistoricalImpactTotals(statistics, animals)
  const campaigns = getActiveCampaigns(settings.campaigns)
  const publicStats: {
    icon: typeof Heart
    label: string
    value: number
  }[] = []
  if (statistics.showRescued) {
    publicStats.push({
      icon: Heart,
      label: "Animais Resgatados",
      value: impactTotals.rescued,
    })
  }
  if (statistics.showAdoptions) {
    publicStats.push({
      icon: HomeIcon,
      label: "Adoções Realizadas",
      value: impactTotals.adoptions,
    })
  }
  if (statistics.showTreatment) {
    publicStats.push({
      icon: Stethoscope,
      label: "Em Tratamento",
      value: counts.treatment,
    })
  }
  if (statistics.showStartYear && statistics.startYear !== null) {
    publicStats.push({
      icon: CalendarDays,
      label: "Desde",
      value: statistics.startYear,
    })
  }

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-[#2E7D6B] to-[#6FAE9C] py-20 text-white md:py-32"
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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#E4B04A] rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg"
            >
              <Heart className="w-5 h-5 text-[#E4B04A]" fill="#E4B04A" />
              <span className="text-sm">Santuário de Animais Anjos da Luz</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              {home.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl mb-4 text-[#F5EFE6]"
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
                {[settings.contact.city, settings.contact.state]
                  .filter(Boolean)
                  .join(" - ")}
              </span>
            </motion.div>
            {home.highlightMessage && (
              <p className="mb-6 rounded-xl bg-white/15 px-4 py-3 text-sm text-white">
                {home.highlightMessage}
              </p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="relative z-10 flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              <Link
                to={home.primaryButtonDestination}
                className="inline-block bg-[#E4B04A] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {home.primaryButtonText}
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/30"
              >
                <Lock size={18} />
                Área Administrativa
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
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

      {/* Stats Section */}
      {campaigns.length > 0 && (
        <section aria-label="Campanhas e avisos" className="bg-white py-8">
          <div className="container mx-auto grid gap-4 px-4 md:grid-cols-2">
            {campaigns.map((campaign) => (
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

      {publicStats.length > 0 || statistics.showSystemCounts ? (
        <section className="py-16 bg-[#F5EFE6]">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {publicStats.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E4B04A]">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mb-1 text-3xl font-bold text-[#2E7D6B]">
                      {value.toLocaleString("pt-BR")}
                      {label.includes("Realizadas") ||
                      label.includes("Resgatados")
                        ? "+"
                        : ""}
                    </p>
                    <p className="text-sm text-[#6FAE9C]">{label}</p>
                  </div>
                ))}
                {statistics.showSystemCounts &&
                  [
                    ["Cadastrados", counts.registered],
                    ["Disponíveis", counts.available],
                    ["Adotados", counts.adopted],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-white p-6 text-center shadow-md"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E4B04A]">
                        <PawPrint className="h-6 w-6 text-white" />
                      </div>
                      <p className="mb-1 text-3xl font-bold text-[#2E7D6B]">
                        {value}
                      </p>
                      <p className="text-sm text-[#6FAE9C]">{label}</p>
                    </div>
                  ))}
              </div>
              {statistics.historicalUpdatedAt && (
                <p className="mt-4 text-center text-xs text-gray-500">
                  Números históricos atualizados em{" "}
                  {new Date(
                    `${statistics.historicalUpdatedAt}T00:00:00`,
                  ).toLocaleDateString("pt-BR")}
                </p>
              )}
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#2E7D6B] mb-4">
                  Sobre o SAAL
                </h2>
                <p className="whitespace-pre-line text-gray-700 mb-4 leading-relaxed">
                  {about.history}
                </p>
                <p className="whitespace-pre-line text-gray-700 mb-6 leading-relaxed">
                  {about.institutionalText}
                </p>
                {about.additionalInfo && (
                  <p className="whitespace-pre-line text-gray-700 mb-6 leading-relaxed">
                    {about.additionalInfo}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/animais"
                    className="bg-[#E4B04A] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-md hover:shadow-lg text-center"
                  >
                    Adotar um Animal
                  </Link>
                  <Link
                    to="/contato"
                    className="bg-[#2E7D6B] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#6FAE9C] transition-all shadow-md hover:shadow-lg text-center"
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
                  <p className="whitespace-pre-line text-[#F5EFE6] leading-relaxed">
                    {about.mission}
                  </p>
                </div>
                {about.photoUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {about.photoUrls.slice(0, 4).map((photoUrl) => (
                      <img
                        key={photoUrl}
                        src={photoUrl}
                        alt="Fotografia institucional do SAAL"
                        className="h-28 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Animals Section */}
      <section className="py-16 bg-[#F5EFE6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2E7D6B] mb-4">
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

          <div className="text-center">
            <Link
              to="/animais"
              className="inline-block bg-[#2E7D6B] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#6FAE9C] transition-all shadow-md hover:shadow-lg"
            >
              Ver Todos os Animais
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2E7D6B] mb-4">
              Como Funciona a Adoção
            </h2>
            <p className="text-[#6FAE9C] max-w-2xl mx-auto">
              {adoption.explanation}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {adoption.steps.map((step, index) => (
              <div key={`${step.title}-${index}`} className="text-center">
                <div className="w-16 h-16 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-[#2E7D6B] mb-2">
                  {step.title}
                </h3>
                <p className="whitespace-pre-line text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          {adoption.requirements && (
            <div className="mx-auto mt-8 max-w-3xl rounded-xl bg-[#F5EFE6] p-5">
              <h3 className="mb-3 font-semibold text-[#2E7D6B]">
                Requisitos e orientações
              </h3>
              <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
                {adoption.requirements
                  .split(/\r?\n/)
                  .filter(Boolean)
                  .map((requirement, index) => (
                    <li key={`${requirement}-${index}`}>{requirement}</li>
                  ))}
              </ul>
            </div>
          )}
          {adoption.faqs.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl space-y-3">
              {adoption.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-xl bg-[#F5EFE6] p-4"
                >
                  <summary className="cursor-pointer font-semibold text-[#2E7D6B]">
                    {faq.question}
                  </summary>
                  <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          )}
          {!adoption.acceptingInterests && (
            <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-[#E4B04A] bg-[#E4B04A]/10 p-4 text-center text-[#6b5425]">
              No momento, o recebimento de novos interesses está pausado.
            </p>
          )}
        </div>
      </section>

      {/* Help Banner */}
      <HelpBanner />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2E7D6B] to-[#6FAE9C] text-white">
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
              className="inline-block bg-[#E4B04A] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Encontre Seu Novo Amigo
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
