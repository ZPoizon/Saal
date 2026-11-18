import { Link } from "react-router"

import { Heart, MapPin } from "lucide-react"

import { motion } from "motion/react"

import { Animal } from "../data/animals"

import { AnimalPhotoFrame } from "./AnimalPhotoFrame"

interface AnimalCardProps {
  animal: Animal
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const statusColors = {
    available: "bg-[#2E7D6B] text-white",
    // Âmbar suave da identidade visual, com texto escuro para contraste (WCAG AA).
    adopted:
      "border border-[#E4B04A]/60 bg-white/95 text-[#6b4e12] shadow-lg backdrop-blur-sm",
  }

  const statusLabels = {
    available: "Disponível",
    adopted: "Adotado",
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
    >
      <Link to={`/animais/${animal.id}`} className="block">
        <AnimalPhotoFrame
          src={animal.images[0]}
          alt={animal.name}
          ratio="aspect-[4/3]"
          className={
            animal.status === "adopted" ? "saturate-[0.55] opacity-95" : ""
          }
        />
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`${statusColors[animal.status]} flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold`}
          >
            {animal.status === "adopted" && (
              <Heart
                size={13}
                className="fill-current text-[#E4B04A]"
                aria-hidden="true"
              />
            )}
            {statusLabels[animal.status]}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="mb-2 break-words text-xl font-bold text-[#2E7D6B]">
            {animal.name}
          </h3>
          <div className="mb-3 flex items-center gap-2 text-sm text-[#6FAE9C]">
            <MapPin size={14} className="shrink-0" />
            <span>
              {animal.age} • {animal.sex === "macho" ? "Macho" : "Fêmea"} •{" "}
              {animal.size}
            </span>
          </div>
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {animal.description}
          </p>
          {animal.status === "available" ? (
            <span className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B04A] py-2 font-semibold text-white transition-colors hover:bg-[#d4a03a]">
              Quero Conhecer
            </span>
          ) : (
            <span className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#F5EFE6] py-2 text-sm font-semibold text-[#527f74]">
              <Heart
                size={15}
                className="fill-current text-[#E4B04A]"
                aria-hidden="true"
              />
              Este animal já encontrou um lar
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
