import { useParams, Link, useNavigate } from "react-router"

import { ArrowLeft, Heart, Calendar, Ruler, Info, Share2 } from "lucide-react"

import { motion } from "motion/react"

import { useEffect, useState } from "react"

import { useAsync } from "../hooks/useAsync"

import { AnimalApiError, getPublicAnimal } from "../services/supabase-animals"

import { PhotoLightbox } from "../components/PhotoLightbox"

import { AnimalPhotoFrame } from "../components/AnimalPhotoFrame"

export function AnimalDetail() {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const {
    data: animal,

    status,

    error,

    reload,
  } = useAsync(`animal-${id ?? ""}`, () =>
    id ? getPublicAnimal(id) : Promise.reject(new AnimalApiError(404)),
  )

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [shareMessage, setShareMessage] = useState<string | null>(null)

  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [animal?.id])

  if (status === "loading") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-[#F5EFE6] px-4 py-12">
        <p role="status" className="text-[#2E7D6B]">
          Carregando animal…
        </p>
      </div>
    )
  }

  if (status === "error" || !animal) {
    const notFound = error instanceof AnimalApiError && error.status === 404

    return (
      <div className="flex min-h-[60dvh] items-center justify-center bg-[#F5EFE6] px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2E7D6B] mb-4">
            {notFound
              ? "Animal não encontrado"
              : "Não foi possível carregar este animal"}
          </h2>
          {notFound ? (
            <Link
              to="/animais"
              className="inline-flex min-h-11 items-center text-[#E4B04A] hover:underline"
            >
              Voltar para lista de animais
            </Link>
          ) : (
            <button
              type="button"
              onClick={reload}
              className="inline-flex min-h-11 items-center text-[#E4B04A] hover:underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  const statusColors = {
    available: "bg-[#2E7D6B] text-white",

    // Âmbar suave da identidade visual, com texto escuro para contraste.

    adopted:
      "border border-[#E4B04A]/60 bg-white/95 text-[#6b4e12] backdrop-blur-sm",
  }

  const statusLabels = {
    available: "Disponível para Adoção",

    adopted: "Adotado",
  }

  const handleShare = async () => {
    const shareData = {
      title: `Conheça ${animal.name} - SAAL`,

      text: `${animal.description}`,

      url: window.location.href,
    }

    setShareMessage(null)

    try {
      if (navigator.share) {
        await navigator.share(shareData)

        return
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url)

        setShareMessage("Link copiado para a área de transferência.")

        return
      }

      setShareMessage("Copie o endereço da página para compartilhar.")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return

      setShareMessage("Não foi possível compartilhar. Tente novamente.")
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-[#2E7D6B] transition-colors hover:text-[#E4B04A]"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Image Gallery */}
          <div>
            <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-lg">
              <div
                className="relative cursor-pointer bg-[#F5EFE6]"
                style={{ aspectRatio: "4/3" }}
                onClick={() => setLightboxOpen(true)}
                role="button"
                tabIndex={0}
                aria-label="Ampliar foto"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()

                    setLightboxOpen(true)
                  }
                }}
              >
                <AnimalPhotoFrame
                  src={animal.images[currentImageIndex]}
                  alt={animal.name}
                  ratio="aspect-[4/3]"
                  className="h-full w-full"
                />
                <div className="absolute top-3 right-3 sm:right-4 sm:top-4 z-10">
                  <span
                    className={`${statusColors[animal.status]} flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg sm:px-4 sm:py-2 sm:text-sm`}
                  >
                    {animal.status === "adopted" && (
                      <Heart
                        size={14}
                        className="fill-current text-[#E4B04A]"
                        aria-hidden="true"
                      />
                    )}
                    {statusLabels[animal.status]}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white z-10">
                  Clique para ampliar
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {animal.images.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {animal.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Ver foto ${index + 1} de ${animal.name}`}
                    aria-pressed={currentImageIndex === index}
                    className={`h-16 w-16 overflow-hidden rounded-lg sm:h-20 sm:w-20 ${
                      currentImageIndex === index
                        ? "ring-4 ring-[#E4B04A]"
                        : "opacity-60 hover:opacity-100"
                    } transition-all`}
                  >
                    <AnimalPhotoFrame
                      src={image}
                      alt={`${animal.name} ${index + 1}`}
                      ratio="aspect-square"
                      className="h-full w-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <h1 className="mb-4 break-words text-2xl font-bold text-[#2E7D6B] sm:text-3xl lg:text-4xl">
              {animal.name}
            </h1>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Calendar size={16} />
                  <span className="text-sm">Idade</span>
                </div>
                <p className="font-semibold text-[#2E7D6B]">{animal.age}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Ruler size={16} />
                  <span className="text-sm">Porte</span>
                </div>
                <p className="font-semibold text-[#2E7D6B] capitalize">
                  {animal.size}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Info size={16} />
                  <span className="text-sm">Sexo</span>
                </div>
                <p className="font-semibold text-[#2E7D6B] capitalize">
                  {animal.sex}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Heart size={16} />
                  <span className="text-sm">Espécie</span>
                </div>
                <p className="font-semibold text-[#2E7D6B]">
                  {animal.species === "dog" ? "Canino" : "Felino"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="font-semibold text-[#2E7D6B] mb-3 flex items-center gap-2">
                <Heart size={18} className="text-[#E4B04A]" />
                Sobre {animal.name}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {animal.description}
              </p>
            </div>

            {/* Personality */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="font-semibold text-[#2E7D6B] mb-3">
                Personalidade
              </h3>
              <div className="flex flex-wrap gap-2">
                {animal.personality.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-[#F5EFE6] text-[#2E7D6B] px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Share Button */}
            <div className="mb-6 rounded-xl bg-[#F5EFE6] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Share2 className="shrink-0 text-[#6FAE9C]" size={20} />
                  <span className="break-words text-sm text-[#2E7D6B]">
                    Compartilhe {animal.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-2 text-sm font-semibold text-[#E4B04A] transition-colors hover:text-[#d4a03a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2E7D6B]"
                >
                  Compartilhar
                </button>
              </div>
              {shareMessage && (
                <p role="status" className="mt-2 text-xs text-[#416f65]">
                  {shareMessage}
                </p>
              )}
            </div>

            {/* CTA ou aviso de adoção concluída */}
            {animal.status === "adopted" && (
              <div className="mb-6 rounded-2xl border border-[#E4B04A]/50 bg-[#E4B04A]/10 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Heart
                      size={22}
                      className="shrink-0 fill-current text-[#E4B04A]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-[#416f65]">
                        Este animal já encontrou um lar!
                      </p>
                      <p className="text-sm text-[#527f74]">
                        Não é possível manifestar interesse, mas a história dele
                        fica aqui.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/animais"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#2E7D6B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#6FAE9C]"
                  >
                    Ver animais disponíveis
                  </Link>
                </div>
              </div>
            )}
            {animal.status === "available" && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/interesse/${animal.id}`}
                  className="block min-h-11 w-full rounded-full bg-[#E4B04A] py-4 text-center font-semibold text-white shadow-lg transition-all hover:bg-[#d4a03a] hover:shadow-xl"
                >
                  Tenho Interesse em Adotar
                </Link>
              </motion.div>
            )}

            <PhotoLightbox
              images={animal.images}
              currentIndex={currentImageIndex}
              open={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              onNavigate={setCurrentImageIndex}
              altBase={animal.name}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
