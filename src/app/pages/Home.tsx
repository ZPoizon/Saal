import { Link } from "react-router"

import {
  Heart,
  Users,
  Home as HomeIcon,
  Stethoscope,
  MapPin,
  Lock,
} from "lucide-react"

import { motion } from "motion/react"

import { AnimalCard } from "../components/AnimalCard"

import { ScrollReveal } from "../components/ScrollReveal"

import { HelpBanner } from "../components/HelpBanner"

import { useAnimals } from "../contexts/AnimalContext"

export function Home() {
  const { animals } = useAnimals()
  const availableAnimals = animals
    .filter((animal) => animal.status === "available")
    .slice(0, 3)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2E7D6B] to-[#6FAE9C] text-white py-20 md:py-32 overflow-hidden">
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
              Ajude um anjo a encontrar um lar
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl mb-4 text-[#F5EFE6]"
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
              className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              <Link
                to="/animais"
                className="inline-block bg-[#E4B04A] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Quero Adotar Agora
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
      <section className="py-16 bg-[#F5EFE6]">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#2E7D6B] mb-1">67</p>
                <p className="text-sm text-[#6FAE9C]">Animais Resgatados</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#2E7D6B] mb-1">280+</p>
                <p className="text-sm text-[#6FAE9C]">Adoções Realizadas</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#2E7D6B] mb-1">15</p>
                <p className="text-sm text-[#6FAE9C]">Em Tratamento</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#2E7D6B] mb-4">
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
      <section className="py-16 bg-[#F5EFE6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2E7D6B] mb-4">
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
