import { Link } from "react-router"

import { Heart, Users, Home as HomeIcon, MapPin, Lock } from "lucide-react"

import { motion } from "motion/react"

import { AnimalCard } from "../components/AnimalCard"

import { useAsync } from "../hooks/useAsync"

import { listPublicAnimals } from "../services/animals-api"

import { ScrollReveal } from "../components/ScrollReveal"

import { HelpBanner } from "../components/HelpBanner"

export function Home() {
  const { data, status, reload } = useAsync("home-animals", () =>
    listPublicAnimals(),
  )

  const availableAnimals = (data ?? []).slice(0, 3)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2E7D6B] to-[#6FAE9C] py-16 text-white sm:py-20 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-20 right-20 h-40 w-40 rounded-full bg-[#E4B04A] blur-3xl"></div>
        </div>
        <div className="container relative mx-auto px-4">
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 text-3xl font-bold leading-tight sm:text-4xl md:text-6xl"
            >
              Ajude um anjo a encontrar um lar
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-4 text-base text-[#F5EFE6] sm:text-lg md:text-xl"
            >
              Cada animal merece uma segunda chance de ser amado. Adote,
              transforme vidas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center justify-center gap-2 text-sm text-[#F5EFE6] mb-8"
            >
              <MapPin size={16} />
              <span>Capão Bonito - SP</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
            >
              <Link
                to="/animais"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B04A] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#d4a03a] hover:shadow-xl sm:w-auto"
              >
                Quero Adotar Agora
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

      {/* Stats Section */}
      <section className="bg-[#F5EFE6] py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white p-4 text-center shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#2E7D6B] mb-1">350+</p>
                <p className="text-sm text-[#6FAE9C]">Animais Resgatados</p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#2E7D6B] mb-1">280+</p>
                <p className="text-sm text-[#6FAE9C]">Adoções Realizadas</p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#2E7D6B] mb-1">1.2k+</p>
                <p className="text-sm text-[#6FAE9C]">Famílias Felizes</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

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
                  O <strong>Santuário de Animais Anjos da Luz (SAAL)</strong> é
                  uma ONG sem fins lucrativos localizada em{" "}
                  <strong>Capão Bonito - SP</strong>, dedicada ao resgate,
                  cuidado e adoção responsável de animais em situação de
                  abandono.
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Nossa missão é proporcionar uma segunda chance para cada
                  animal que chega até nós, oferecendo tratamento veterinário,
                  alimentação adequada e muito amor até encontrarem uma família
                  para sempre.
                </p>
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
                    Resgatar, proteger e encontrar lares amorosos para animais
                    abandonados, promovendo a adoção responsável e o bem-estar
                    animal em Capão Bonito e região.
                  </p>
                </div>
              </div>
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
              Conheça alguns dos nossos anjinhos que estão esperando por uma
              família cheia de amor
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
              Nosso processo é cuidadoso para garantir o bem-estar do animal e a
              compatibilidade com sua família
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-[#2E7D6B] mb-2">
                Escolha o Animal
              </h3>
              <p className="text-sm text-gray-600">
                Navegue pelo catálogo e encontre o pet que conquistou seu
                coração
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-[#2E7D6B] mb-2">
                Manifeste Interesse
              </h3>
              <p className="text-sm text-gray-600">
                Preencha o formulário com seus dados e conte sobre você
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-[#2E7D6B] mb-2">Entrevista</h3>
              <p className="text-sm text-gray-600">
                Nossa equipe entrará em contato para conhecê-lo melhor
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="font-semibold text-[#2E7D6B] mb-2">Adote!</h3>
              <p className="text-sm text-gray-600">
                Após aprovação, leve seu novo amigo para casa com muito amor
              </p>
            </div>
          </div>
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
