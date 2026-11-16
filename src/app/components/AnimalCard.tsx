import { Link } from "react-router"

import { Heart, MapPin } from "lucide-react"

import { motion } from "motion/react"

import { Animal } from "../data/animals"

import { withImageParams } from "../utils/images"

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
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl"
    >
      <Link to={`/animais/${animal.id}`} className="block">
        <div className="relative h-64 overflow-hidden bg-[#F5EFE6]">
          <img
            src={withImageParams(animal.images[0] ?? "", {
              w: 500,

              h: 500,

              fit: "crop",
            })}
            alt={animal.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
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
        <div className="p-5">
          <h3 className="text-xl font-bold text-[#2E7D6B] mb-2">
            {animal.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#6FAE9C] mb-3">
            <MapPin size={14} />
            <span>
              {animal.age} • {animal.sex === "macho" ? "Macho" : "Fêmea"} •{" "}
              {animal.size}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {animal.description}
          </p>
          {animal.status === "available" && (
            <span className="block w-full bg-[#E4B04A] text-white py-2 rounded-full font-semibold hover:bg-[#d4a03a] transition-colors">
              Quero Conhecer
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
