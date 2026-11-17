import { Link } from "react-router"

import { Heart, MapPin } from "lucide-react"

import { motion } from "motion/react"

import { Animal } from "../data/animals"

import { SafeImage } from "./SafeImage"

interface AnimalCardProps {
  animal: Animal
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const statusColors = {
    available: "bg-[#2E7D6B] text-white",

    adopted: "bg-gray-400 text-white",
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
        <div className="relative h-56 overflow-hidden bg-[#F5EFE6] sm:h-64">
          <SafeImage
            src={animal.images[0]}
            alt={animal.name}
            params={{ w: 500, h: 500, fit: "crop" }}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`${statusColors[animal.status]} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}
            >
              {statusLabels[animal.status]}
            </span>
          </div>
          {animal.status === "adopted" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E4B04A]" fill="#E4B04A" />
                <span className="font-semibold text-[#2E7D6B]">Adotado</span>
              </div>
            </div>
          )}
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
          {animal.status === "available" && (
            <span className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B04A] py-2 font-semibold text-white transition-colors hover:bg-[#d4a03a]">
              Quero Conhecer
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
